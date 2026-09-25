import { toast as sonner } from "sonner";

export const notify = {
  success: (message: string, description?: string) => sonner.success(message, { description }),
  error: (message: string, description?: string) => sonner.error(message, { description }),
  info: (message: string, description?: string) => sonner.info(message, { description }),
  loading: (message: string) => sonner.loading(message),
  dismiss: (id?: string | number) => sonner.dismiss(id),
};

export { sonner as toast };
