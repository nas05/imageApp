import React, { useState } from 'react';
import { gql, useMutation,  useLazyQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";


const SIGNUP_MUTATION = gql`
mutation createUser(
    $email: String!
    $password: String!
    $fullname: String!
  ) {
    createUser(fullname:$fullname, email:$email,password:$password)
    {
      fullname,
      email,
      password
    }
  }
`;

const LOGIN_QUERY = gql`
  query LoginQuery(
    $email: String!
    $password: String!
  ) {
    Login(email: $email, password: $password) {
      id,
      fullname
    }
  }
`;

const Index = () => {
    const [authMode, setAuthMode] = useState("signin");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const navigate = useNavigate();

    const [signup, { loading, error, }] = useMutation(
        SIGNUP_MUTATION,{
            onCompleted: data=>{
                alert("Signup Complete");
                getLogin({
                    variables:{
                        password:password,
                        email:email,
                    }
                })
            }
        }
    );

    const [getLogin, { loginLoading, loginError, loginData }] = useLazyQuery(
        LOGIN_QUERY,{
            onCompleted: (data) => {
                if("Login" in data && data.Login!=null)
                {
                    localStorage.setItem("userId", data.Login.id);
                    localStorage.setItem("username", data.Login.fullname);
                    navigate("/home");
                }
                else{
                    alert("Wrong Username or Password")
                }
               }
        }
    );

    const changeAuthMode = () => {
        setAuthMode(authMode === "signin" ? "signup" : "signin")
        setEmail("");
        setPassword("");
        setFullName("");
    }

    const SumbitLogin = (e) => {
        e.preventDefault();
        getLogin({
            variables:{
                password:password,
                email:email,
            }
        })
        if (loginError) {
            console.log(loginError)
        }
    }

    const sumbitSignUp = (e) => {
        e.preventDefault();

        signup({
            variables: {
                fullname: fullName,
                email: email,
                password: password,
            }
        })
        if (error) {
            console.log("Error" + error)
        }

    }

    if (authMode === "signin") {
        return (
            <div className="Auth-form-container">
                <form className="Auth-form" onSubmit={SumbitLogin}>
                    <div className="Auth-form-content">
                        <h3 className="Auth-form-title">Sign In</h3>
                        <div className="text-center">
                            Not registered yet?{" "}
                            <span className="link-primary" onClick={changeAuthMode}>
                                Sign Up
                            </span>
                        </div>
                        <div className="form-group mt-3">
                            <label>Email address</label>
                            <input
                                type="email"
                                className="form-control mt-1"
                                placeholder="Enter email"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                            />
                        </div>
                        <div className="form-group mt-3">
                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control mt-1"
                                placeholder="Enter password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                            />
                        </div>
                        <div className="d-grid gap-2 mt-3">
                            <button type="submit" className="btn btn-primary" >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="Auth-form-container">
            <form className="Auth-form" onSubmit={sumbitSignUp}>
                <div className="Auth-form-content">
                    <h3 className="Auth-form-title">Sign UP</h3>
                    <div className="text-center">
                        Already registered?{" "}
                        <span className="link-primary" onClick={changeAuthMode}>
                            Sign in
                        </span>
                    </div>
                    <div className="form-group mt-3">
                        <label>Full Name</label>
                        <input
                            type="text"
                            className="form-control mt-1"
                            placeholder="e.g Jane Doe"
                            onChange={(e) => setFullName(e.target.value)}
                            value={fullName}
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label>Email address</label>
                        <input
                            type="email"
                            className="form-control mt-1"
                            placeholder="Email Address"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </div>
                    <div className="form-group mt-3">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control mt-1"
                            placeholder="Password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>
                    <div className="d-grid gap-2 mt-3">
                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Index;