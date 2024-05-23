// import React, { useState } from 'react';
// import {
//   Card,
//   Input,
//   Checkbox,
//   Button,
//   Typography,
//   Select,
//   Option,
// } from "@material-tailwind/react";
// import { Link, useNavigate } from "react-router-dom";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth, db } from "../../firebaseConfig"; // Adjust the path as necessary
// import { doc, setDoc } from "firebase/firestore";

// export function SignUp() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("user"); // Default role
//   const navigate = useNavigate();

//   const handleSignUp = async (event) => {
//     event.preventDefault();
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // Add user information to Firestore with the selected role
//       await setDoc(doc(db, "users", user.uid), {
//         email: user.email,
//         role: role,
//       });

//       // Redirect to the dashboard or appropriate page after successful registration
//       navigate("/dashboard");
//     } catch (error) {
//       console.error("Error signing up:", error);
//     }
//   };

//   return (
//     <section className="m-8 flex">
//       <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
//         <div className="text-center">
//           <Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
//           <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email, password, and role to register.</Typography>
//         </div>
//         <form onSubmit={handleSignUp} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
//           <div className="mb-1 flex flex-col gap-6">
//             <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
//               Your email
//             </Typography>
//             <Input
//               size="lg"
//               placeholder="name@mail.com"
//               className="!border-t-blue-gray-200 focus:!border-t-gray-900"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
//               Password
//             </Typography>
//             <Input
//               type="password"
//               size="lg"
//               placeholder="********"
//               className="!border-t-blue-gray-200 focus:!border-t-gray-900"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
//               Select Role
//             </Typography>
//             <Select
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               size="lg"
//               className="!border-t-blue-gray-200 focus:!border-t-gray-900"
//             >
//               <Option value="user">User</Option>
//               <Option value="admin">Admin</Option>
//             </Select>
//           </div>
//           <Checkbox
//             label={
//               <Typography
//                 variant="small"
//                 color="gray"
//                 className="flex items-center justify-start font-medium"
//               >
//                 I agree to the&nbsp;
//                 <a
//                   href="#"
//                   className="font-normal text-black transition-colors hover:text-gray-900 underline"
//                 >
//                   Terms and Conditions
//                 </a>
//               </Typography>
//             }
//             containerProps={{ className: "-ml-2.5" }}
//           />
//           <Button type="submit" className="mt-6" fullWidth>
//             Register Now
//           </Button>
//           <Typography variant="paragraph" className="text-center text-blue-gray-500 font-medium mt-4">
//             Already have an account?
//             <Link to="/auth/sign-in" className="text-gray-900 ml-1">Sign in</Link>
//           </Typography>
//         </form>
//       </div>
//     </section>
//   );
// }

// export default SignUp;
import React, { useState } from 'react';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig"; // Adjust the path as necessary
import { doc, setDoc } from "firebase/firestore";

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
      console.log("User registered successfully!");
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <section className="m-8 flex">
      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="font-bold mb-4">Join Us Today</Typography>
          <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your email, password, and role to register.</Typography>
        </div>
        <form onSubmit={handleSignUp} className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
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
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                I agree to the&nbsp;
                <a
                  href="#"
                  className="font-normal text-black transition-colors hover:text-gray-900 underline"
                >
                  Terms and Conditions
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          <Button type="submit" className="mt-6" fullWidth>
             Add User
          </Button>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
