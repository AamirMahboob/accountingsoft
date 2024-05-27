
import React, { useState } from 'react';
import {
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig"; // Adjust the path as necessary
import { doc, setDoc } from "firebase/firestore";
import { toast } from 'react-toastify';

export function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user information to Firestore with the selected role
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
      });

      // Optionally show a success message here
      console.log("User registered successfully with role:", role);
      toast.success("User registered successfully!");
      // navigate("/home"); // Redirect to the home page after successful registration
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("Error signing up: " + error.message);
    }
  };

  return (
    <section className="m-8 flex justify-start items-start">
      <div className="w-full lg:w-4/5 flex flex-col ">
        
          <Typography variant="h2" className="font-bold mb-4 ml-10    ">Add User</Typography>
        
        <form onSubmit={handleSignUp} className="mt-8 mb-2 ml-11 mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="mb-1 flex flex-col gap-6">
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Your email
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Password
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
              Select Role
            </Typography>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              size="lg"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            >
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </div>
          <Button type="submit" className="mt-6" fullWidth>
            Add User
          </Button>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
