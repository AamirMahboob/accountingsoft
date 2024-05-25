import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardBody, Typography } from "@material-tailwind/react";

export function Tables() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userData = [];
        querySnapshot.forEach((doc) => {
          userData.push({ id: doc.id, ...doc.data() });
        });
        console.log("Fetched users:", userData); // Debug log
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <Card>
      <CardBody>
        <Typography variant="h5" className="mb-4">
          User List
        </Typography>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}

export default Tables;
