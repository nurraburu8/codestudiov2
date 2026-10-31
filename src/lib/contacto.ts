/**
 * Links de contacto rápido (WhatsApp / mail / formulario) para los llamados a
 * la acción de cada trabajo. El mensaje ya menciona el trabajo que se vio.
 */
import { CONTACT } from '@/consts';
import type { TrabajoCategory } from '@lib/trabajos';

export interface ContactLinks {
  whatsapp: string | null;
  mail: string;
  form: string;
}

export function contactLinks(client: string): ContactLinks {
  const texto = `Hola Code Studio! Vi el trabajo de ${client} en la web y quiero hacerles una consulta.`;
  return {
    whatsapp: CONTACT.whatsapp
      ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(texto)}`
      : null,
    mail:
      `mailto:${CONTACT.email}` +
      `?subject=${encodeURIComponent(`Consulta desde la web — ${client}`)}` +
      `&body=${encodeURIComponent(`${texto}\n\n`)}`,
    form: `/contacto?trabajo=${encodeURIComponent(client)}`,
  };
}

/** Título del llamado a la acción según la sección del trabajo. */
export const CTA_TITULOS: Record<TrabajoCategory, string> = {
  Shows: '¿Tenés un show o una fiesta?',
  Campañas: '¿Tenés un evento o una campaña?',
  Fotografía: '¿Necesitás fotos de producto?',
};
