export interface dattType {
  drive: {
    main: {
      fileBar: {
        Delete: {
          confirm_msg: string;
          deleted_msg: string;
          no: string;
          yes: string;
        };
        Download: {
          download_msg: string;
        };
        FileView: {
          download_msg: string;
          view_error: string;
        };
        Logout: {
          confirm_msg: string;
          no: string;
          yes: string;
        };
        NewFolder: {
          add_file_msg: string;
          file_input: string;
          no: string;
        };
        Upload: {
          added_msg: string;
          already_exists: string;
          upload_msg: string;
          yes: string;
        };
        Rename: {
          rename_msg: string;
          renamed_msg: string;
          file_name: string;
          no: string;
        };
        MoveFile: {
          moved_msg: string;
        };
      };
      fileList: {
        no_file: string;
      };
      title: string;
    };
    login: {
      main: {
        id_input: string;
        pass_input: string;
        reset_btn: string;
        remember_btn: string;
        new_user_btn: string;
      };
      new_user: {
        add_btn: string;
        blank_msg: string;
        main_pass: string;
        msg_codes: {
          success_detail: string;
          user_already_exist: string;
        };
      };
      reset: {
        blank_msg: string;
        new_pass: string;
        reset_btn: string;
        msg_codes: {
          success_detail: string;
          user_not_found: string;
          wrong_email: string;
        };
      };
      title: string;
      drive_auth_msgs: {
        expired_credentials: string;
        user_not_found: string;
        wrong_credentials: string;
        wrong_pass: string;
      };
    };
  };
}
