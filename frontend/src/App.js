import React from 'react';
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import "bootstrap/dist/css/bootstrap.min.css"
//import Auth from './components/auth'
//import Home from '../src/components/Home'
import './App.css'

import Auth from './components/Auth/index'
import Home from './components/Home/index'

const client = new ApolloClient({
    uri: 'http://127.0.0.1:3001/graphql',
    cache: new InMemoryCache(),
});

const App = () => {
    return (
        <div className="App">
            <BrowserRouter>
            <ApolloProvider client={client}>
                <>
                    <Routes>
                        <Route exact path="/auth" element={<Auth/>} />
                        <Route exact path="/home" element={<Home/>}/>
                    </Routes>
                </>
            </ApolloProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;