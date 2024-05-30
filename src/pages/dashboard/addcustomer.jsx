// CustomerCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as needed

const AddCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoader(true);
      const customerCollection = collection(db, 'customers');
      const customerSnapshot = await getDocs(customerCollection);
      const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customerList);
      setLoader(false);
    };

    fetchCustomers();
  }, []);

  const handleAddEditCustomer = async () => {
    if (!name || !email || !phone || !address) {
      setError('All fields must be filled out');
      return;
    }

    setLoader(true);
    const newCustomer = { name, email, phone, address };
    setError('');

    if (editIndex !== null) {
      const customerDoc = doc(db, 'customers', customers[editIndex].id);
      await updateDoc(customerDoc, newCustomer);
      const updatedCustomers = customers.map((customer, index) =>
        index === editIndex ? { ...customer, ...newCustomer } : customer
      );
      setCustomers(updatedCustomers);
      setEditIndex(null);
    } else {
      const docRef = await addDoc(collection(db, 'customers'), newCustomer);
      setCustomers([...customers, { ...newCustomer, id: docRef.id }]);
    }
    setLoader(false);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
  };

  const handleEdit = (index) => {
    const customer = customers[index];
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone);
    setAddress(customer.address);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const customerDoc = doc(db, 'customers', customers[index].id);
    await deleteDoc(customerDoc);
    const updatedCustomers = customers.filter((_, i) => i !== index);
    setCustomers(updatedCustomers);
    setLoader(false);
  };

  return (
    <Card>
      {/* <Typography variant="h5">Customers</Typography>
      <CardBody>
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col">
            <Typography variant="h6">Name</Typography>
            <Input
              type="text"
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Email</Typography>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Phone</Typography>
            <Input
              type="text"
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Address</Typography>
            <Input
              type="text"
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button className="w-32 h-10 mt-6" onClick={handleAddEditCustomer}>
            {editIndex !== null ? 'Edit Customer' : 'Add Customer'}
          </Button>
        </div>
        {error && <Typography color="red">{error}</Typography>}
        {loader ? (
          <Typography>Loading...</Typography>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Address</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.email}</td>
                  <td className="px-6 py-4">{customer.phone}</td>
                  <td className="px-6 py-4">{customer.address}</td>
                  <td className="px-6 py-4">
                    <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                    <Button size="sm" onClick={() => handleDelete(index)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody> */}
    </Card>
  );
};

export default AddCustomer;
