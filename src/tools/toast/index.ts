const get_toast_module = async () => (await import('@zerodevx/svelte-toast')).toast;

type toast_classes = 'info' | 'error' | 'success';

type pos = 'top' | 'bottom'; // positions
type dirs = 'right' | 'left' | 'centre'; //directions
type toast_positions = `${pos}-${dirs}`;

const get_toast_func = (type: toast_classes) => {
  return async (msg: string, duration = 2000, position: toast_positions = 'top-centre') => {
    const toast = await get_toast_module();
    toast.push(msg, {
      pausable: true,
      duration: duration,
      classes: [type + '_qxt76c', position + '_kwd2op'],
      target: position
    });
  };
};

export const toast = {
  error: get_toast_func('error'),
  info: get_toast_func('info'),
  success: get_toast_func('success')
};
