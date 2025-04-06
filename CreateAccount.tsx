import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/styles.css";

interface RegisterForm {
    username: string;
    email: string;
    password: string;
}

const CreateAccount: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<RegisterForm>();

    const onSubmit = async (data: RegisterForm) => {
        try {
            const response = await axios.post("http://localhost/react_api/register.php",
                JSON.stringify(data),
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Response:", response.data);

            if (response.data.message) {
                alert(response.data.message);
                reset(); // Clears the form after successful registration
            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            alert("An error occurred. Check console for details.");
        }
    };

    return (
        <div>
            <Navbar />  {/* Properly include Navbar at the top */}
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("username")} placeholder="Username" required />
                <input {...register("email")} type="email" placeholder="Email" required />
                <input {...register("password")} type="password" placeholder="Password" required />
                <button type="submit">Register</button>
            </form>
            <Footer />  {/* Properly include Footer at the bottom */}
        </div>
    );
};

export default CreateAccount;
