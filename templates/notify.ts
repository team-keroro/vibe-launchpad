// Toast messages for the whole app (Sonner, via shadcn/ui).
// Defaults (set on <Toaster /> in App): bottom-center, auto-dismiss after 5 seconds.
// Pass { persistent: true } when a message must stay until the user closes it.
import { toast, type ExternalToast } from 'sonner'

export type NotifyOptions = ExternalToast & {
  /** Keep the toast on screen until the user closes it (no auto-dismiss). */
  persistent?: boolean
}

function toToastOptions({ persistent, ...rest }: NotifyOptions = {}): ExternalToast {
  return persistent ? { duration: Infinity, closeButton: true, ...rest } : rest
}

export const notify = {
  success: (message: string, options?: NotifyOptions) => toast.success(message, toToastOptions(options)),
  error: (message: string, options?: NotifyOptions) => toast.error(message, toToastOptions(options)),
  info: (message: string, options?: NotifyOptions) => toast.info(message, toToastOptions(options)),
  warning: (message: string, options?: NotifyOptions) => toast.warning(message, toToastOptions(options)),
  dismiss: (id?: string | number) => toast.dismiss(id),
}

/** Default settings for the app's single <Toaster /> (spread into it). */
export const TOASTER_DEFAULTS = {
  position: 'bottom-center',
  duration: 5000,
  richColors: true,
  closeButton: true,
} as const
