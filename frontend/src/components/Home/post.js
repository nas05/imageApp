import React from 'react'
import { gql, useMutation, useQuery } from "@apollo/client";

const LIKE_MUTATION = gql`
mutation ImageLike(
    $image_id: Int!
    $user_id: Int!
  ) {
    createImageLike(user_id:$user_id, image_id:$image_id){
        id,
        user_id,
        image_id
    }
  }
`;

const GET_IMAGE_LIKES = gql`
query GetImageLikes(
    $image_id: ID!
){
	ImageLikes(image_id:$image_id){
        likes
  }
}
`

const Post = (props) => {

    const [likePic, { loading, error, }] = useMutation(
        LIKE_MUTATION,{
            onCompleted: data=>{
                alert("Image Liked");
                window.location.reload();
            }
        }
    );

    const likeImage = (imageId)=>{
        const userId = parseInt(localStorage.getItem("userId"))
        likePic({
            variables:{
                image_id:parseInt(imageId),
                user_id:userId,
            }
        })
        if(error){
            console.log(error)
        }
    }

    const {likesLoading, likesError, data} = useQuery(
        GET_IMAGE_LIKES,{
            variables:{
                image_id:parseInt(props.data.id)
            }
        }
    );

    return (
        <div className="col" id={props.data.id}>
            <div className="card border-secondary bg-light mb-3" style={{ width: "20rem", height: "30rem" }}>
                <img className="card-img-top" src={props.data.image_link} alt="Card image cap" />
                <div className="card-body">
                    <button className="btn btn-primary" id={props.data.id} onClick={()=>likeImage(props.data.id)}>Like</button>
                </div>
                <div className='card-footer'>
                Likes: {data ?data.ImageLikes.likes:<></>}
                </div>
            </div>
        </div>
    )
}
export default Post;
