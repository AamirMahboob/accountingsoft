// CustomerCard.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Adjust the import path as needed
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CustomerCard = () => {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [crNo, setCrNo] = useState('');
  const [pobox, setPobox] = useState('');
  const [bldgAddress, setBldgAddress] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'add', 'edit', 'delete'

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
    if (!name || !crNo || !pobox || !bldgAddress) {
      setError('All fields must be filled out');
      return;
    }

    setLoader(true);
    const newCustomer = { name, crNo, pobox, bldgAddress };
    setError('');

    if (editIndex !== null) {
      const customerDoc = doc(db, 'customers', customers[editIndex].id);
      await updateDoc(customerDoc, newCustomer);
      const updatedCustomers = customers.map((customer, index) =>
        index === editIndex ? { ...customer, ...newCustomer } : customer
      );
      setCustomers(updatedCustomers);
      setEditIndex(null);
      toast.success('Customer updated successfully!');
    } else {
      const docRef = await addDoc(collection(db, 'customers'), newCustomer);
      setCustomers([...customers, { ...newCustomer, id: docRef.id }]);
      toast.success('Customer added successfully!');
    }

    setLoader(false);
    setName('');
    setCrNo('');
    setPobox('');
    setBldgAddress('');
    setDialogOpen(false);
  };

  const handleEdit = (index) => {
    const customer = customers[index];
    setName(customer.name);
    setCrNo(customer.crNo);
    setPobox(customer.pobox);
    setBldgAddress(customer.bldgAddress);
    setEditIndex(index);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const customerDoc = doc(db, 'customers', customers[index].id);
    await deleteDoc(customerDoc);
    const updatedCustomers = customers.filter((_, i) => i !== index);
    setCustomers(updatedCustomers);
    setLoader(false);
    toast.success('Customer deleted successfully!');
    setDialogOpen(false);
  };

  return (
    <Card>
      <Typography variant="h5" className='m-5'>Customers</Typography>
      <CardBody>
        <Button className="mb-4" onClick={() => { setDialogType('add'); setDialogOpen(true); }}>Add Customer</Button>
        {loader ? (
          <Typography><Spinner /></Typography>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">CR No</th>
                <th className="px-6 py-3 text-left">P.O. Box</th>
                <th className="px-6 py-3 text-left">Building Address</th>
                
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{customer.name}</td>
                  <td className="px-6 py-4">{customer.crNo}</td>
                  <td className="px-6 py-4">{customer.pobox}</td>
                  <td className="px-6 py-4">{customer.bldgAddress}</td>
                  <td className="px-6 py-4 flex  space-x-4">
                    {/* <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                    <Button size="sm" onClick={() => { setEditIndex(index); setDialogType('delete'); setDialogOpen(true); }}>Delete</Button> */}
                    <FaEdit color="blue-gray" className='cursor-pointer' onClick={() => handleEdit(index)} />
                    <FaTrash color="red" className='cursor-pointer' onClick={() => { setEditIndex(index); setDialogType('delete'); setDialogOpen(true); }} />
                    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>

      <Dialog open={dialogOpen} handler={() => setDialogOpen(false)}>
        <DialogHeader>
          {dialogType === 'delete' ? 'Delete Customer' : editIndex !== null ? 'Edit Customer' : 'Add Customer'}
        </DialogHeader>
        <DialogBody>
          {dialogType === 'delete' ? (
            <Typography>Are you sure you want to delete this customer?</Typography>
          ) : (
            <div className="flex flex-col space-y-4">
              <Input
                type="text"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="text"
                label="CR No"
                value={crNo}
                onChange={(e) => setCrNo(e.target.value)}
              />
              <Input
                type="text"
                label="P.O. Box"
                value={pobox}
                onChange={(e) => setPobox(e.target.value)}
              />
              <Input
                type="text"
                label="Building Address"
                value={bldgAddress}
                onChange={(e) => setBldgAddress(e.target.value)}
              />
              {error && <Typography color="red">{error}</Typography>}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          {dialogType === 'delete' ? (
            <>
              <Button variant="text" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="filled" color="red" onClick={() => handleDelete(editIndex)}>Delete</Button>
            </>
          ) : (
            <>
              <Button variant="text" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="filled" onClick={handleAddEditCustomer}>
                {editIndex !== null ? 'Edit Customer' : 'Add Customer'}
              </Button>
            </>
          )}
        </DialogFooter>
      </Dialog>
    </Card>
  );
};

export default CustomerCard;
