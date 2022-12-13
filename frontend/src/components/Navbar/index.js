import React, {useState}from 'react';
import { gql, useMutation } from "@apollo/client";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import axios from "axios";

const UPLOAD_MUTATION = gql`
mutation createImageMutation(
    $image_link: String!
    $user_id: Int!
  ) {
    createImage(user_id:$user_id, image_link:$image_link)
    {
        id,
        user_id,
    }
  }
`;


const Navbar = () => {
    const logout = () => {
        localStorage.clear()
        window.location.href = "/auth"
    }

    const [uploadPic, { loading, error, }] = useMutation(
        UPLOAD_MUTATION, {
        onCompleted: data => {
            alert("Upload Complete");
            window.location.reload();
        }
    }
    );

    const uploadPicture = (imageLink) => {
        uploadPic({
            variables: {
                image_link: imageLink,
                user_id: parseInt(localStorage.getItem("userId"))
            }
        })
        if (error) {
            alert("Upload Failed")
        }
    }
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [file, setFile] = useState(null);


    const handleFileChange = (event) => {
        setFile(event.target.files);
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData();
        for (var x = 0; x < file.length; x++) {
            data.append('file', file[x])
        }
        axios.post("http://localhost:3001/upload", data)
            .then(res => {
                uploadPicture("http://localhost:3001/images/"+res.data.filename)
            })
    }
    return (
        <div>
            <nav className="navbar navbar navbar-dark bg-dark justify-content-between">
                <a className="navbar-brand m-2">Welcome {localStorage.getItem("username")}</a>
                <button className="btn btn-outline-primary my-2 my-sm-0" type="button"  onClick={handleShow}>Upload Picture</button>
                <button className="btn btn-outline-success my-2 my-sm-0 m-4" type="button" onClick={logout}>Logout</button>
            </nav>


            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form >
                        <div className="form-group" >

                            <label htmlFor="file">Upload File:</label>
                            <input
                                className="form-control-file mb-3"
                                type="file" id="file"
                                accept=".jpg"
                                multiple
                                onChange={handleFileChange}
                            />

                            <button
                                className="btn btn-primary mt-3"
                                onClick={handleSubmit}
                            >Upload</button>
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    );
};

export default Navbar;