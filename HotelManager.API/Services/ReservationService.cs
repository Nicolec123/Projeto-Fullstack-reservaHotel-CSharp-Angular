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
        return MapToDto(res);
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

    public async Task<ReservationDto?> CreateAsync(int userId, CreateReservationRequest request, CancellationToken ct = default)
    {
        if (request.DataInicio >= request.DataFim)
            return null;

        if (request.DataInicio.Date < DateTime.UtcNow.Date)
            return null;

        var room = await _roomRepo.GetByIdAsync(request.RoomId, ct);
        if (room == null || room.Bloqueado)
            return null;

        var hasConflict = await _reservationRepo.HasConflictAsync(request.RoomId, request.DataInicio, request.DataFim, null, ct);
        if (hasConflict)
            return null;

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
                statusReserva = statusPagamento == "Pago" ? "Confirmada" : "Pendente";
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
            DataPagamento = paymentResult?.Success == true && statusPagamento == "Pago" ? DateTime.UtcNow : null
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

        return created == null ? null : MapToDto(created);
    }

    public async Task<ReservationDto?> CancelAsync(int id, int userId, bool isAdmin, CancellationToken ct = default)
    {
        var res = await _reservationRepo.GetByIdAsync(id, ct);
        if (res == null) return null;
        if (!isAdmin && res.UserId != userId) return null;
        if (res.Status == "Cancelada") return MapToDto(res);

        res.Status = "Cancelada";
        await _reservationRepo.UpdateAsync(res, ct);
        return MapToDto(res);
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
            CodigoBoleto = r.CodigoBoleto
        };
    }
}
