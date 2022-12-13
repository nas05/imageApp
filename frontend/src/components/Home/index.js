import React from 'react'
import { gql, useQuery } from "@apollo/client";

import Post from './post.js'
import Header from '../Navbar'
import { useNavigate } from "react-router-dom";

const FETCH_IMAGES = gql`
query ImagesQuery{
  Images{
    id,
    user_id,
    image_link
  }
}
`;

const Home = () => {
    const { loading, error, data } = useQuery(FETCH_IMAGES,{
        onCompleted: (data) => {
            if(data)
            {
                console.log(data)
            }
            else{
                alert("Failed to fetch Images");
            }
           }
    });
    const navigate = useNavigate();
    const isLoggedIn = ()=>{
        const id = localStorage.getItem('userId');
        if (!id){
            navigate("/auth");
        }
    }
    return (
        <>
        {isLoggedIn()}
            <Header />
            <div className='container'>

                <div className='row row-cols-md-3 g-4 mt-5'>
                    {data && data.Images.map((data, index) => {
                        return <div id={index}><Post data={data} /></div>
                    })}
                </div>
            </div>
        </>
    )
}

export default Home;