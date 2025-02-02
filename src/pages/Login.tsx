import React from 'react';
import AuthService from "../service/auth-service";
import {CssBaseline, ThemeProvider} from "@mui/material";
import {customTheme} from "../theme/customTheme";
import {ErrorMessage, Field, Form, Formik} from "formik";
import {useNavigate} from "react-router-dom";

const initialValues = {
  username: "victor",
  password: "budau",
};

export default function Login() {
  const navigate = useNavigate()
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline/>
      <Formik
        initialValues={initialValues}
        onSubmit={async formValues => {
          const logged = await AuthService.login(formValues.username, formValues.password)
          if (logged) navigate("/")
          else alert("Invalid login credentials try again")
        }}
      >
        <Form placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <div>
            <label htmlFor="username">Username</label>
            <Field name="username" type="text"/>
            <ErrorMessage name="username" component="div"/>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <Field name="password" type="password"/>
            <ErrorMessage name="password" component="div"/>
          </div>

          <div>
            <button type="submit">
              Login
            </button>
          </div>
        </Form>
      </Formik>
    </ThemeProvider>
  )
}
