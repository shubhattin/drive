export const dattStruct = {
  drive: {
    main: {
      fileBar: {
        Delete: {
          confirm_msg: '',
          deleted_msg: '',
          no: '',
          yes: ''
        },
        Download: {
          download_msg: ''
        },
        FileView: {
          download_msg: '',
          view_error: ''
        },
        Logout: {
          confirm_msg: '',
          no: '',
          yes: ''
        },
        NewFolder: {
          add_file_msg: '',
          file_input: '',
          no: ''
        },
        Upload: {
          added_msg: '',
          already_exists: '',
          upload_msg: '',
          yes: ''
        },
        Rename: {
          rename_msg: '',
          renamed_msg: '',
          file_name: '',
          no: ''
        },
        MoveFile: {
          moved_msg: ''
        }
      },
      fileList: {
        no_file: ''
      },
      title: ''
    },
    login: {
      main: {
        id_input: '',
        pass_input: '',
        reset_btn: '',
        remember_btn: '',
        new_user_btn: ''
      },
      new_user: {
        add_btn: '',
        blank_msg: '',
        main_pass: '',
        msg_codes: {
          success_detail: '',
          user_already_exist: ''
        }
      },
      reset: {
        blank_msg: '',
        new_pass: '',
        reset_btn: '',
        msg_codes: {
          success_detail: '',
          user_not_found: '',
          wrong_email: ''
        }
      },
      title: '',
      drive_auth_msgs: {
        expired_credentials: '',
        user_not_found: '',
        wrong_credentials: '',
        wrong_pass: ''
      }
    }
  }
};
type dattStructType = typeof dattStruct;
export interface dattType extends dattStructType {}
