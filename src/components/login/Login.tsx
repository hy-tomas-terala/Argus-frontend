import React, {useEffect, useState} from "react";

import { useHistory } from "react-router-dom";

// MUI
import Typography from "@material-ui/core/Typography";
import { TextFieldProps } from "@material-ui/core/TextField";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

// Api
import type {ConfiguredLoginMethodsResponse, User} from "../../api/types.d";
import api from "../../api";
import auth from "../../auth";

// Contexts/Hooks
import {useApiState, useUser} from "../../state/hooks";

// Components
import OutlinedTextField from "../../components/textfields/OutlinedTextField";
import Button from "../../components/buttons/OutlinedButton";
import Logo from "../../components/logo/Logo";
import {Cookies} from "react-cookie";
import {useAlerts} from "../alertsnackbar";
import {KnownLoginMethodType} from "../../api/types.d";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    loginContainer: {
      backgroundColor: theme.palette.primary.dark,
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "center",
      padding: theme.spacing(4),
      borderRadius: "10px",
    },
    loginWithFeideContainer: {
      display: "flex",
      flexDirection: "column",
      flexWrap: "nowrap",
      alignItems: "center",
      padding: 0,
      margin: 0,
    },
    loginWithFeideButton: {
      padding: theme.spacing(0.5),
      backgroundColor: theme.palette.primary.dark,
      borderRadius: "5px",
    },
    loginItem: {
      margin: theme.spacing(2),
      flexGrow: 1,
    },
    divider: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: theme.spacing(2),
    },
    logo: {
      minHeight: "150px",
      minWidth: "150px",
    },
    whiteTextInput: {
      color: "white",
    },
  }),
);

const WhiteOutlinedTextField = (props: TextFieldProps) => {
  const style = useStyles();
  return (
    <OutlinedTextField
      InputProps={{
        classes: {
          input: style.whiteTextInput,
        },
      }}
      InputLabelProps={{
        classes: {
          root: style.whiteTextInput,
        },
      }}
      {...props}
    />
  );
};

const LoginForm: React.FC<{}> = () => {
  const cookies = new Cookies();
  const style = useStyles();
  const history = useHistory();

  const [, { login, logout }] = useUser();
  const [apiState] = useApiState();
  const displayAlert = useAlerts();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isWrongCredentials, setIsWrongCredentials] = useState<boolean>(false);
  const [isUserpassFailed, setIsUserpassFailed] = useState<boolean>(false);

  const [feideLoginUrl, setFeideLoginUrl] = useState<string | undefined>(undefined);

  // On mount
  useEffect(() => {
      api.getConfiguredLoginMethods()
          .then((res: ConfiguredLoginMethodsResponse) => {
              setFeideLoginUrl(res[KnownLoginMethodType.FEIDE]);
          })
          .catch((error) => {
              setFeideLoginUrl(undefined);
          })
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


    // On unmount
  useEffect(() => () => {
      setFeideLoginUrl(undefined);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const logUserOut = async () => {
    logout();
    auth.logout();
  }

  useEffect(() => {
    if (apiState.hasConnectionProblems) {
      setIsWrongCredentials(false);
    } else {
      setIsWrongCredentials(isUserpassFailed);
    }
  }, [apiState.hasConnectionProblems, isUserpassFailed]);

  useEffect(() => {
    const token = cookies.get("token")

    if (token && token !== undefined) {
      history.push("/");
    }
  });


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let token;

    if (auth.token() && auth.token() !== undefined) {
      token = auth.token();
    } else {
      token = await api.userpassAuth(username, password)
        .catch(async () => {
          setIsUserpassFailed(true);
          await logUserOut();
        });
    }

    if (token) {
      setIsUserpassFailed(false);
      auth.login(token, async () => {
        await api
          .authGetCurrentUser()
          .then((resUser: User) => {
            login(resUser);
            history.push("/");
          })
          .catch(async (error) => {
            displayAlert(error.message, "error");
            await logUserOut();
          })
      });
    } else {
      await logUserOut();
    }
  };

  return (
    <form onSubmit={onSubmit} id="login-form">
      <div className={style.loginContainer}>
        <div className={style.loginItem}>
          <Logo className={style.logo} />
        </div>
        <WhiteOutlinedTextField
          id="username-input"
          error={isWrongCredentials}
          className={style.loginItem}
          variant="outlined"
          label="Username"
          value={username}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value as string;
            setUsername(value);
          }}
        />
        <WhiteOutlinedTextField
          id="password-input"
          error={isWrongCredentials}
          helperText={isWrongCredentials && "Wrong username or password"}
          className={style.loginItem}
          variant="outlined"
          label="Password"
          type="password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value as string;
            setPassword(value);
          }}
        />
        <Button className={style.loginItem} type="submit" variant="outlined">
          Login
        </Button>
      </div>
        {feideLoginUrl !== undefined && (
            <>
                <div className={style.divider}>
                    <Typography color="textSecondary">OR</Typography>
                </div>
                <div className={style.loginWithFeideContainer}>
                    <Button
                        className={style.loginWithFeideButton}
                        variant="outlined"
                        href={feideLoginUrl}
                    >
                        Federated Login
                    </Button>
                </div>
            </>
        )}
    </form>
  );
};

export default LoginForm;
