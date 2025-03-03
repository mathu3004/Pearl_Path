import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar"; // Ensure this is the correct path to your Navbar component
import Footer from "../Footer"; // Ensure this is the correct path to your Footer component
import "../styles/styles.css"; // Make sure the CSS path is correct

interface LoginForm {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const { register, handleSubmit, reset } = useForm<LoginForm>();
    const navigate = useNavigate(); // Hook for programmatically navigating

    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await axios.post("http://localhost/react_api/login.php",
                JSON.stringify(data),
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Response:", response.data);

            if (response.data.message) {
                alert(`Welcome, ${response.data.user.username}!`);
                reset(); // Clears the form after successful login
                navigate("/trip-plan-page"); // Ensure this route is correctly defined in your Router setup
            } else {
                alert(response.data.error);
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("An error occurred. Check console for details.");
        }
    };

    return (
        <div>
            <Navbar />  {/* Properly include Navbar at the top */}
            <h2>Login</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input {...register("email")} type="email" placeholder="Email" required />
                <input {...register("password")} type="password" placeholder="Password" required />
                <button type="submit">Login</button>
            </form>
            <Footer />  {/* Properly include Footer at the bottom */}
        </div>
    );
};

export default Login;
