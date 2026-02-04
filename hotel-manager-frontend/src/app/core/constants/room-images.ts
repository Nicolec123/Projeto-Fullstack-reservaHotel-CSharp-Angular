/**
 * Mapeamento das imagens dos quartos em public/quartosdehotel/
 * Quarto1 a Quarto5 correspondem aos números 1-5.
 */
export const ROOM_IMAGES: Record<string, string[]> = {
  '1': [
    '/quartosdehotel/Quarto1/pexels-byung-chul-min-2151741451-35632438.jpg',
    '/quartosdehotel/Quarto1/pexels-cottonbro-5371573.jpg',
    '/quartosdehotel/Quarto1/pexels-cottonbro-6466216.jpg',
    '/quartosdehotel/Quarto1/pexels-didi-lecatompessy-2149441489-33125906.jpg'
  ],
  '2': [
    '/quartosdehotel/Quarto2/pexels-aj-ahamad-767001191-30147882.jpg',
    '/quartosdehotel/Quarto2/pexels-digitalbuggu-167533.jpg',
    '/quartosdehotel/Quarto2/pexels-magda-ehlers-pexels-32008153.jpg',
    '/quartosdehotel/Quarto2/pexels-quang-nguyen-vinh-222549-29000012.jpg'
  ],
  '3': [
    '/quartosdehotel/Quarto3/pexels-aj-ahamad-767001191-32168943.jpg',
    '/quartosdehotel/Quarto3/pexels-mographe-34955133.jpg',
    '/quartosdehotel/Quarto3/pexels-svh-manali-1801124329-28347477.jpg',
    '/quartosdehotel/Quarto3/pexels-tima-miroshnichenko-6010267.jpg'
  ],
  '4': [
    '/quartosdehotel/Quarto4/pexels-aasif-pathan-321950386-31222661.jpg',
    '/quartosdehotel/Quarto4/pexels-christoph-sixt-53441410-35857672.jpg',
    '/quartosdehotel/Quarto4/pexels-introspectivedsgn-9715221.jpg',
    '/quartosdehotel/Quarto4/pexels-joyboy-903012424-27910933.jpg'
  ],
  '5': [
    '/quartosdehotel/Quarto5/pexels-anne-cecile-robert-2152415877-34854573.jpg',
    '/quartosdehotel/Quarto5/pexels-cottonbro-6466291.jpg',
    '/quartosdehotel/Quarto5/pexels-misbaa-eri-426041722-35103155.jpg'
  ]
};

export function getRoomImageUrl(numero: string): string | null {
  const images = ROOM_IMAGES[String(numero)];
  return images?.[0] ?? null;
}

export function getRoomImages(numero: string): string[] {
  return ROOM_IMAGES[String(numero)] ?? [];
}
