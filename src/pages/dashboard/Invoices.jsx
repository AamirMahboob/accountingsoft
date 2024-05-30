import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig'; // Adjust the import path as needed
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [proof, setProof] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // New state for proof upload status

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoader(true);
      const invoiceCollection = collection(db, 'invoices');
      const invoiceSnapshot = await getDocs(invoiceCollection);
      const invoiceList = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invoiceList);
      setLoader(false);
    };

    const fetchCustomers = async () => {
      const customerCollection = collection(db, 'customers');
      const customerSnapshot = await getDocs(customerCollection);
      const customerList = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCustomers(customerList);
    };

    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleAddEditInvoice = async () => {
    if (!selectedCustomer || !description || !date || !amount || !proof) {
      setError('All fields must be filled out');
      return;
    }
  
    setLoader(true);
    setError('');
  
    try {
      // Upload proof file (image or PDF) to Firebase Storage
      const proofRef = ref(storage, `proofs/${proof.name}`);
      await uploadBytes(proofRef, proof);
      const uploadedProofUrl = await getDownloadURL(proofRef);
      setProofUrl(uploadedProofUrl);
  
      const newInvoice = {
        customer: selectedCustomer,
        description,
        date,
        amount,
        proofUrl: uploadedProofUrl
      };
  
      if (editIndex !== null) {
        const invoiceDoc = doc(db, 'invoices', invoices[editIndex].id);
        await updateDoc(invoiceDoc, newInvoice);
        const updatedInvoices = invoices.map((invoice, index) =>
          index === editIndex ? { ...invoice, ...newInvoice } : invoice
        );
        setInvoices(updatedInvoices);
        setEditIndex(null);
      } else {
        const docRef = await addDoc(collection(db, 'invoices'), newInvoice);
        setInvoices([...invoices, { ...newInvoice, id: docRef.id }]);
      }
  
      setSelectedCustomer('');
      setDescription('');
      setDate('');
      setAmount('');
      setProof(null);
      setProofUrl('');
    } catch (error) {
      console.error("Error uploading file and saving invoice: ", error);
      setError('There was an error saving the invoice. Please try again.');
    } finally {
      setLoader(false);
    }
  };
  
  

  const handleEdit = (index) => {
    const invoice = invoices[index];
    setSelectedCustomer(invoice.customer);
    setDescription(invoice.description);
    setDate(invoice.date);
    setAmount(invoice.amount);
    setProofUrl(invoice.proofUrl);
    setEditIndex(index);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const invoiceDoc = doc(db, 'invoices', invoices[index].id);
    await deleteDoc(invoiceDoc);
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    setLoader(false);
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Invoice</title></head><body>');
    printWindow.document.write(`<h1>Invoice</h1>`);
    printWindow.document.write(`<p><strong>Customer:</strong> ${invoice.customer}</p>`);
    printWindow.document.write(`<p><strong>Description:</strong> ${invoice.description}</p>`);
    printWindow.document.write(`<p><strong>Date:</strong> ${invoice.date}</p>`);
    printWindow.document.write(`<p><strong>Amount:</strong> ${invoice.amount}</p>`);
    printWindow.document.write(`<p><strong>Proof:</strong> <a href="${invoice.proofUrl}" target="_blank">View Proof</a></p>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className='overflow-y-hidden'>
      {/* <Typography variant="h5">Invoices</Typography>
      <CardBody>
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col">
            <Typography variant="h6">Customer</Typography>
            <Select
              label="Select Customer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              {customers.map((customer, index) => (
                <Option key={index} value={customer.name}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Description</Typography>
            <Input
              type="text"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Date</Typography>
            <Input
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Amount</Typography>
            <Input
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Proof</Typography>
            <Input
              type="file"
              label="Upload Proof"
              onChange={(e) => setProof(e.target.files[0])}
            />
          </div>
          <Button 
  className="w-32 h-10 mt-6" 
  onClick={handleAddEditInvoice} 
  disabled={loader}
>
  {editIndex !== null ? 'Edit Invoice' : 'Add Invoice'}
</Button>

        </div>
        {error && <Typography color="red">{error}</Typography>}
        {loader ? (
          <Typography>Loading...</Typography>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{invoice.customer}</td>
                  <td className="px-6 py-4">{invoice.description}</td>
                  <td className="px-6 py-4">{invoice.date}</td>
                  <td className="px-6 py-4">{invoice.amount}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                    <Button size="sm" onClick={() => handleDelete(index)}>Delete</Button>
                    <Button size="sm" onClick={() => handlePrint(invoice)}>Print</Button>
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

export default Invoices;
