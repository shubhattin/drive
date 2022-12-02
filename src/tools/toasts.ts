export const toast_error = async (msg: string, duration = 800) => {
  const toast = (await import('@zerodevx/svelte-toast')).toast;
  toast.push(msg, {
    pausable: true,
    duration: duration,
    theme: {
      '--toastBackground': 'rgb(255,100,100)',
      '--toastColor': 'white',
      '--toastBarBackground': 'rgb(255,50,50)'
    }
  });
};
