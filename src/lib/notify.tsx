import { toast as sonner } from "sonner";

/**
 * Notificações Chrónos — estilo único em toda a aplicação.
 * Sem emojis: apenas ícones vetoriais finos (definidos no Toaster global).
 * Uso: notify.success("Amizade aceite")
 */
export const notify = {
  success: (message: string, description?: string) => sonner.success(message, { description }),
  error: (message: string, description?: string) => sonner.error(message, { description }),
  info: (message: string, description?: string) => sonner.info(message, { description }),
  loading: (message: string) => sonner.loading(message),
  dismiss: (id?: string | number) => sonner.dismiss(id),
};

export { sonner as toast };
