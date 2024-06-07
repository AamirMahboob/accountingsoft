import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Dialog, DialogHeader, DialogBody, DialogFooter, Spinner } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig'; // Adjust the import path as needed
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPrint } from 'react-icons/fa';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const InvoiceCard = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [invoiceEntries, setInvoiceEntries] = useState([{ description: '', date: '', qty: '', amount: '' }]);
  const [proofImage, setProofImage] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({ name: '', crNo: '', pobox: '', bldgAddress: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'add', 'edit', 'delete'

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

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setCustomerDetails({ name: customer.name, crNo: customer.crNo, pobox: customer.pobox, bldgAddress: customer.bldgAddress });
    }
  };

  const handleAddEditInvoice = async () => {
    console.log("Selected Customer:", selectedCustomer);
    console.log("Invoice Entries:", invoiceEntries);
    console.log("Proof Image:", proofImage);

    if (!selectedCustomer || invoiceEntries.some(entry => !entry.description || !entry.date || !entry.qty || !entry.amount) || !proofImage) {
      setError('All fields must be filled out');
      return;
    }

    setLoader(true);
    setError('');

    const storageRef = ref(storage, `proofs/${proofImage.name}`);
    const uploadTask = uploadBytesResumable(storageRef, proofImage);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Handle progress
      },
      (error) => {
        setError('Failed to upload proof image');
        setLoader(false);
      },
      async () => {
        const proofURL = await getDownloadURL(uploadTask.snapshot.ref);
        const newInvoice = { customer: selectedCustomer, entries: invoiceEntries, proofURL, ...customerDetails };

        if (editIndex !== null) {
          const invoiceDoc = doc(db, 'invoices', invoices[editIndex].id);
          await updateDoc(invoiceDoc, newInvoice);
          const updatedInvoices = invoices.map((invoice, index) =>
            index === editIndex ? { ...invoice, ...newInvoice } : invoice
          );
          setInvoices(updatedInvoices);
          setEditIndex(null);
          toast.success('Invoice updated successfully!');
        } else {
          const docRef = await addDoc(collection(db, 'invoices'), newInvoice);
          setInvoices([...invoices, { ...newInvoice, id: docRef.id }]);
          toast.success('Invoice added successfully!');
        }

        setLoader(false);
        setSelectedCustomer('');
        setInvoiceEntries([{ description: '', date: '', qty: '', amount: '' }]);
        setProofImage(null);
        setCustomerDetails({ name: '', crNo: '', pobox: '', bldgAddress: '' });
        setDialogOpen(false);
      }
    );
  };

  const handleEntryChange = (index, field, value) => {
    const updatedEntries = invoiceEntries.map((entry, i) => i === index ? { ...entry, [field]: value } : entry);
    setInvoiceEntries(updatedEntries);
  };

  const addEntry = () => {
    setInvoiceEntries([...invoiceEntries, { description: '', date: '', qty: '', amount: '' }]);
  };

  const removeEntry = (index) => {
    setInvoiceEntries(invoiceEntries.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const invoice = invoices[index];
    setSelectedCustomer(invoice.customer);
    setInvoiceEntries(invoice.entries || []);
    setProofImage(null);
    setCustomerDetails({ name: invoice.name, crNo: invoice.crNo, pobox: invoice.pobox, bldgAddress: invoice.bldgAddress });
    setEditIndex(index);
    setDialogType('edit');
    setDialogOpen(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const invoiceDoc = doc(db, 'invoices', invoices[index].id);
    await deleteDoc(invoiceDoc);
    const updatedInvoices = invoices.filter((_, i) => i !== index);
    setInvoices(updatedInvoices);
    setLoader(false);
    toast.success('Invoice deleted successfully!');
    setDialogOpen(false);
  };

  const handlePrint = (index) => {
    const invoice = invoices[index];
    const printWindow = window.open('', '', 'width=800,height=600');
  
    printWindow.document.write(`
    <html>
      <head>
        
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="font-sans p-5">
        <div class="flex justify-center items-center">
           <h2 class="text-2xl font-bold">NDT Global W.L.L</h2>
           <hr style="width:100%;text-align:left;margin-left:0">
        </div>
        <div class="flex justify-center items-center">
           <h2 class="text-2xl font-bold text-center">Tax Invoice</h2>
        </div>
       
          <h1 class="text-3xl font-bold mb-5">Tax Invoice</h1>
          <div class="invoice-details mb-5">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>Invoice #: ${invoice.crNo || 'N/A'}</p>
          </div>
          <div class="customer-details mb-5">
            <h3 class="text-xl font-semibold">To:</h3>
            <p>${invoice.name}</p>
            <p>CR No: ${invoice.crNo}</p>
            <p>P.O. Box: ${invoice.pobox}</p>
            <p>Building Address: ${invoice.bldgAddress}</p>
          </div>
          <table class="w-full border-collapse border border-gray-400">
            <thead>
              <tr class="bg-gray-200">
                <th class="border border-gray-400 px-4 py-2">Description</th>
                <th class="border border-gray-400 px-4 py-2">Date</th>
                <th class="border border-gray-400 px-4 py-2">Quantity</th>
                <th class="border border-gray-400 px-4 py-2">Amount (BHD)</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.entries.map(entry => `
                <tr>
                  <td class="border border-gray-400 px-4 py-2">${entry.description}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.date}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.qty}</td>
                  <td class="border border-gray-400 px-4 py-2">${entry.amount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="gap-10 mt-32 flex flex-col">
            <p>For NDT Global W.L.L</p>
            <p>Abdul Razak M. Mohamed Murthaja</p>
            <p>Director</p>
          </div>
        </div>
        <div class="mt-20 flex flex-col">
            <h2 class="text-2xl font-bold">NDT Global W.L.L</h2>
            <p>CR: 125208-1</p>
            <p>BIW Business Park / PO.Box. 52009 / No.122 / Bldg. 2004 / Road. 1527 / Block. 115 / Hidd</p>
            <p>Kingdom of Bahrain</p>
            <p>Tel: +973-17006610 / Mobile: +973-33445432</p>
            <p>Web: www.ndtglobalwll.com | Email: admin@ndtglobalwll.com</p>
          </div>

      </body>
    </html>
  `);
  
    printWindow.document.close();
    printWindow.print();
  };
  

  const openDialog = (type) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setError('');
    setSelectedCustomer('');
    setInvoiceEntries([{ description: '', date: '', qty: '', amount: '' }]);
    setProofImage(null);
    setCustomerDetails({ name: '', crNo: '', pobox: '', bldgAddress: '' });
    setEditIndex(null);
  };

  return (
    <Card className="mt-6">
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-6">Invoices</Typography>
        <Button   className="mb-4" onClick={() => openDialog('add')}>Add Invoice</Button>

        {loader ? <Spinner className="h-12 w-12" /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr>
                  <th className="py-2 px-4 border">Customer</th>
                  <th className="py-2 px-4 border">Entries</th>
                  <th className="py-2 px-4 border">Proof</th>
                  <th className="py-2 px-4 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border">{invoice.name}</td>
                    <td className="py-2 px-4 border">
                      <ul>
                        {invoice.entries.map((entry, i) => (
                          <li key={i}>{entry.description} - {entry.date} - {entry.qty} - {entry.amount}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-2 px-4 border"><a href={invoice.proofURL} target="_blank" rel="noopener noreferrer">View Proof</a></td>
                    <td className="py-2 px-4 border">
                      <Button variant="text" color="blue" onClick={() => handleEdit(index)}><FaEdit /></Button>
                      <Button variant="text" color="red" onClick={() => openDialog('delete')}><FaTrash /></Button>
                      <Button variant="text" color="green" onClick={() => handlePrint(index)}><FaPrint /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
      <Dialog  open={dialogOpen} handler={closeDialog} size="lg">
        <DialogHeader>{dialogType === 'edit' ? 'Edit Invoice' : dialogType === 'delete' ? 'Delete Invoice' : 'Add Invoice'}</DialogHeader>
        <DialogBody divider>
          {dialogType === 'delete' ? (
            <Typography variant="paragraph">Are you sure you want to delete this invoice?</Typography>
          ) : (
            <>
              <div className="mb-4">
                <label>Customer</label>
                <select value={selectedCustomer} onChange={handleCustomerChange} className="w-full p-2 border">
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                {invoiceEntries.map((entry, index) => (
                  <div key={index} className="mb-2 flex gap-2">
                    <Input type="text" placeholder="Description" value={entry.description} onChange={(e) => handleEntryChange(index, 'description', e.target.value)} />
                    <Input type="date" placeholder="Date" value={entry.date} onChange={(e) => handleEntryChange(index, 'date', e.target.value)} />
                    <Input type="number" placeholder="Quantity" value={entry.qty} onChange={(e) => handleEntryChange(index, 'qty', e.target.value)} />
                    <Input type="number" placeholder="Amount" value={entry.amount} onChange={(e) => handleEntryChange(index, 'amount', e.target.value)} />
                    <Button color="red" onClick={() => removeEntry(index)}>Remove</Button>
                  </div>
                ))}
                <Button color="blue" onClick={addEntry}>Add Entry</Button>
              </div>
              <div className="mb-4">
                <label>Proof Image</label>
                <Input type="file" onChange={(e) => setProofImage(e.target.files[0])} />
              </div>
              {error && <Typography variant="small" color="red">{error}</Typography>}
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={closeDialog} className="mr-2">Cancel</Button>
          {dialogType === 'delete' ? (
            <Button variant="gradient" color="red" onClick={() => handleDelete(editIndex)}>Delete</Button>
          ) : (
            <Button variant="gradient" color="blue" onClick={handleAddEditInvoice}>Save</Button>
          )}
        </DialogFooter>
      </Dialog>
    </Card>
  );
};

export default InvoiceCard;
