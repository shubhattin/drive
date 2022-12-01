export interface dattType {
  drive: {
    main: {
      fileBar: {
        Delete: { confirm_msg: string; no: string; yes: string };
        Download: { download_msg: string };
        FileView: { download_msg: string; view_error: string };
        Logout: { confirm_msg: string; no: string; yes: string };
        NewFolder: { add_file_msg: string; file_input: string; no: string };
        Reload: { added_msg: string; deleted_msg: string };
        Upload: { upload_msg: string; yes: string };
      };
      fileList: { no_file: string };
      title: string;
    };
    login: {
      main: { id_input: string; pass_input: string; reset_btn: string; remember_btn: string };
      new_user: { add_btn: string; blank_msg: string; main_pass: string };
      reset: {
        blank_msg: string;
        current_pass: string;
        new_pass: string;
        new_user_btn: string;
        reset_btn: string;
      };
      title: string;
    };
  };
  tracker: { pass_error: string; pass_input: string; title: string };
}
