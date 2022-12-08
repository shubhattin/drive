const get_toast_module = async () => (await import('@zerodevx/svelte-toast')).toast;

type toast_classes = 'info' | 'error' | 'success';

const get_toast_func = (type: toast_classes = 'info') => {
  return async (msg: string, duration = 800) => {
    const toast = await get_toast_module();
    toast.push(msg, {
      pausable: true,
      duration: duration,
      classes: [type]
    });
  };
};

export const toast = {
  error: get_toast_func('error')
};
