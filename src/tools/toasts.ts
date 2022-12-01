import { toast } from '@zerodevx/svelte-toast';

export const toast_error = (msg: string, duration = 800) =>
  toast.push(msg, {
    pausable: true,
    duration: duration,
    classes: ['dkjkj'],
    theme: {
      '--toastBackground': 'rgb(255,100,100)',
      '--toastColor': 'white',
      '--toastBarBackground': 'rgb(255,50,50)'
    }
  });

// export const warning = m => toast.push(m, { theme: { ... } })

// export const failure = m => toast.push(m, { theme: { ... } })
