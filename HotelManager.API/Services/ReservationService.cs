using HotelManager.API.DTOs.Reservation;
using HotelManager.API.Models;
using HotelManager.API.Repositories;

namespace HotelManager.API.Services;

public class ReservationService : IReservationService
{
    private readonly IReservationRepository _reservationRepo;
    private readonly IRoomRepository _roomRepo;
    private readonly IPaymentService _paymentService;
    private readonly IEmailService _emailService;

    public ReservationService(
        IReservationRepository reservationRepo, 
        IRoomRepository roomRepo,
        IPaymentService paymentService,
        IEmailService emailService)
    {
        _reservationRepo = reservationRepo;
        _roomRepo = roomRepo;
        _paymentService = paymentService;
        _emailService = emailService;
    }

    public async Task<ReservationDto?> GetByIdAsync(int id, int? userId, bool isAdmin, CancellationToken ct = default)
    {
        var res = await _reservationRepo.GetByIdAsync(id, ct);
        if (res == null) return null;
        if (!isAdmin && res.UserId != userId) return null;
        
        var dto = MapToDto(res);
        
        // Se foi reagendada, busca informações da reserva original
        if (res.ReagendadaDeReservationId.HasValue)
        {
            var original = await _reservationRepo.GetByIdAsync(res.ReagendadaDeReservationId.Value, ct);
            if (original != null)
            {
                var dias = (original.DataFim - original.DataInicio).Days;
                if (dias < 1) dias = 1;
                dto.ReservaOriginal = new ReservationOriginalInfo
                {
                    Id = original.Id,
                    DataInicio = original.DataInicio,
                    DataFim = original.DataFim,
                    RoomNumero = original.Room?.Numero,
                    PrecoTotal = original.ValorTotal ?? (original.Room != null ? original.Room.PrecoDiaria * dias : null)
                };
            }
        }
        
        return dto;
    }

    public async Task<(List<ReservationDto> Items, int Total)> GetByUserAsync(int userId, int page, int pageSize, CancellationToken ct = default)
    {
        var list = await _reservationRepo.GetByUserIdAsync(userId, ct);
        var total = list.Count;
        var items = list.Skip((page - 1) * pageSize).Take(pageSize).Select(MapToDto).ToList();
        return (items, total);
    }

    public async Task<(List<ReservationDto> Items, int Total)> GetAllAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var list = await _reservationRepo.GetAllAsync(page, pageSize, ct);
        var total = await _reservationRepo.CountAsync(ct);
        return (list.Select(MapToDto).ToList(), total);
    }

    public async Task<CreateReservationResult> CreateAsync(int userId, CreateReservationRequest request, CancellationToken ct = default)
    {
        if (request.DataInicio >= request.DataFim)
            return new CreateReservationResult { Success = false, FailureReason = CreateReservationFailureReason.InvalidDates };

        if (request.DataInicio.Date < DateTime.UtcNow.Date)
            return new CreateReservationResult { Success = false, FailureReason = CreateReservationFailureReason.InvalidDates };

        var room = await _roomRepo.GetByIdAsync(request.RoomId, ct);
        if (room == null || room.Bloqueado)
            return new CreateReservationResult { Success = false, FailureReason = CreateReservationFailureReason.RoomUnavailable };

        // Normaliza para comparação por dia (evita fuso/meia-noite)
        var dataInicio = request.DataInicio.Date;
        var dataFim = request.DataFim.Date;

        // Se ExcludeReservationId foi informado (reagendamento), exclui essa reserva da validação de conflito
        var excludeReservationId = request.ExcludeReservationId;

        var hasConflict = await _reservationRepo.HasConflictAsync(request.RoomId, dataInicio, dataFim, excludeReservationId, ct);
        if (hasConflict)
            return new CreateReservationResult { Success = false, FailureReason = CreateReservationFailureReason.RoomConflict };

        // Mesmo usuário não pode ter duas reservas que compartilhem qualquer dia (ex.: 06–11 e 06–12 são sobrepostas)
        // Mas exclui a reserva que está sendo reagendada
        var overlappingIds = await _reservationRepo.GetUserOverlappingIdsAsync(userId, dataInicio, dataFim, excludeReservationId, ct);
        if (overlappingIds.Count > 0)
            return new CreateReservationResult { Success = false, FailureReason = CreateReservationFailureReason.UserOverlap, OverlappingReservationIds = overlappingIds };

        // Calcula valor total
        var dias = (request.DataFim - request.DataInicio).Days;
        if (dias < 1) dias = 1;
        var taxaCriancaPorNoite = 50m;
        var taxaPetPorNoite = 80m;
        var valorHospedagem = room.PrecoDiaria * dias;
        var valorCriancas = request.Criancas * dias * taxaCriancaPorNoite;
        var valorPets = request.Pets * dias * taxaPetPorNoite;
        var valorTotal = valorHospedagem + valorCriancas + valorPets;

        // Processa pagamento se método foi informado
        PaymentResult? paymentResult = null;
        string? statusPagamento = null;
        string? statusReserva = "Pendente";

        if (!string.IsNullOrEmpty(request.MetodoPagamento))
        {
            paymentResult = await _paymentService.ProcessPaymentAsync(
                valorTotal, 
                request.MetodoPagamento, 
                request.TokenPagamento, 
                ct);

            if (paymentResult.Success)
            {
                statusPagamento = request.MetodoPagamento.ToLower() switch
                {
                    "cartaocredito" => "Pago",
                    "pix" => "Aguardando",
                    "boleto" => "Aguardando",
                    _ => "Pendente"
                };
                // Em homologação: cartão = Pago/Confirmada; PIX e Boleto = Confirmada (quarto bloqueado) com pagamento Aguardando
                statusReserva = "Confirmada";
            }
            else
            {
                statusPagamento = "Recusado";
            }
        }

        var reservation = new Reservation
        {
            UserId = userId,
            RoomId = request.RoomId,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            Status = statusReserva,
            Adultos = request.Adultos,
            Criancas = request.Criancas,
            Pets = request.Pets,
            Observacoes = request.Observacoes,
            MetodoPagamento = request.MetodoPagamento,
            StatusPagamento = statusPagamento,
            ValorTotal = valorTotal,
            CodigoPix = paymentResult?.CodigoPix,
            CodigoBoleto = paymentResult?.CodigoBoleto,
            TokenPagamento = request.TokenPagamento,
            DataPagamento = paymentResult?.Success == true && statusPagamento == "Pago" ? DateTime.UtcNow : null,
            ReagendadaDeReservationId = excludeReservationId // Marca como reagendada se houver excludeReservationId
        };

        // Adiciona hóspedes adicionais
        if (request.Guests != null && request.Guests.Any())
        {
            foreach (var guestDto in request.Guests)
            {
                reservation.Guests.Add(new Guest
                {
                    Nome = guestDto.Nome,
                    Cpf = guestDto.Cpf,
                    DataNascimento = guestDto.DataNascimento,
                    Nacionalidade = guestDto.Nacionalidade,
                    Telefone = guestDto.Telefone,
                    Tipo = guestDto.Tipo,
                    Idade = guestDto.Idade
                });
            }
        }

        reservation = await _reservationRepo.CreateAsync(reservation, ct);
        var created = await _reservationRepo.GetByIdAsync(reservation.Id, ct);

        // Envia email de confirmação
        if (created != null)
        {
            _ = Task.Run(async () => await _emailService.SendReservationConfirmationAsync(created, ct));
        }

        return new CreateReservationResult
        {
            Success = true,
            Reservation = created != null ? MapToDto(created) : null,
            FailureReason = CreateReservationFailureReason.None
        };
    }

    /// <summary>
    /// Regra: cancelamento gratuito até 48 horas antes do check-in. Após esse período, cobrança de 1 diária.
    /// </summary>
    public async Task<CancellationInfoDto?> GetCancellationInfoAsync(int id, int? userId, bool isAdmin, CancellationToken ct = default)
    {
        var res = await _reservationRepo.GetByIdAsync(id, ct);
        if (res == null) return null;
        if (!isAdmin && res.UserId != userId) return null;
        if (res.Status == "Cancelada") return null;

        var checkIn = res.DataInicio;
        var limiteGratuito = checkIn.AddHours(-48);
        var agora = DateTime.UtcNow;
        var aplicaTaxa = agora > limiteGratuito;
        var valorTaxa = aplicaTaxa && res.Room != null ? res.Room.PrecoDiaria : 0;

        return new CancellationInfoDto
        {
            AplicaTaxa = aplicaTaxa,
            ValorTaxa = valorTaxa,
            Mensagem = aplicaTaxa
                ? $"Cancelamento após o prazo. Será cobrada 1 diária: R$ {valorTaxa:N2}."
                : "Cancelamento gratuito (até 48 horas antes do check-in)."
        };
    }

    public async Task<CancelReservationResult> CancelAsync(int id, int userId, bool isAdmin, CancelReservationRequest? request, CancellationToken ct = default)
    {
        var res = await _reservationRepo.GetByIdAsync(id, ct);
        if (res == null)
            return new CancelReservationResult { Success = false };
        if (!isAdmin && res.UserId != userId)
            return new CancelReservationResult { Success = false };
        if (res.Status == "Cancelada")
            return new CancelReservationResult { Success = true, Reservation = MapToDto(res) };

        var checkIn = res.DataInicio;
        var limiteGratuito = checkIn.AddHours(-48);
        var agora = DateTime.UtcNow;
        var aplicaTaxa = agora > limiteGratuito;
        var valorTaxa = aplicaTaxa && res.Room != null ? res.Room.PrecoDiaria : 0;

        if (aplicaTaxa && valorTaxa > 0)
        {
            var token = request?.TokenPagamento;
            if (string.IsNullOrWhiteSpace(token))
                return new CancelReservationResult { Success = false, PaymentRequired = true, FeeAmount = valorTaxa };

            var paymentResult = await _paymentService.ProcessPaymentAsync(valorTaxa, "CartaoCredito", token, ct);
            if (!paymentResult.Success)
                return new CancelReservationResult { Success = false, PaymentRequired = true, FeeAmount = valorTaxa };
        }

        res.Status = "Cancelada";
        await _reservationRepo.UpdateAsync(res, ct);
        return new CancelReservationResult { Success = true, Reservation = MapToDto(res) };
    }

    private static ReservationDto MapToDto(Reservation r)
    {
        var dias = (r.DataFim - r.DataInicio).Days;
        if (dias < 1) dias = 1;
        return new ReservationDto
        {
            Id = r.Id,
            UserId = r.UserId,
            RoomId = r.RoomId,
            UserNome = r.User?.Nome,
            RoomNumero = r.Room?.Numero,
            DataInicio = r.DataInicio,
            DataFim = r.DataFim,
            Status = r.Status,
            PrecoTotal = r.ValorTotal ?? (r.Room != null ? r.Room.PrecoDiaria * dias : null),
            MetodoPagamento = r.MetodoPagamento,
            StatusPagamento = r.StatusPagamento,
            CodigoPix = r.CodigoPix,
            CodigoBoleto = r.CodigoBoleto,
            ReagendadaDeReservationId = r.ReagendadaDeReservationId
        };
    }
}
