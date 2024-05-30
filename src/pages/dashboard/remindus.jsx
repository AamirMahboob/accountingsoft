import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export function InvoicesManagement() {
  const [invoices, setInvoices] = useState([]);
  const [month, setMonth] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoader(true);
      const invoicesCollection = collection(db, 'invoices');
      const invoicesSnapshot = await getDocs(invoicesCollection);
      const invoicesList = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invoicesList);
      setLoader(false);
    };

    fetchInvoices();
  }, []);

  const handleFilterByMonth = () => {
    if (!month) return;

    const filtered = invoices.filter(invoice => invoice.month === month);
    setFilteredInvoices(filtered);
  };

  const handleClearFilter = () => {
    setMonth('');
    setFilteredInvoices([]);
  };

  // Your other CRUD operations (add, edit, delete) can be added here

  return (
    // <Card>
    //   <Typography variant="h5">Invoices Management</Typography>
    //   <CardBody className='overflow-y-hidden'>
    //     <div className="flex space-x-4 mb-4">
    //       <div className="flex flex-col">
    //         <Typography variant="h6">Filter by Month</Typography>
    //         <Input
    //           type="text"
    //           label="Month"
    //           value={month}
    //           onChange={(e) => setMonth(e.target.value)}
    //         />
    //         <Button className="w-32 h-10 mt-4" onClick={handleFilterByMonth}>Filter</Button>
    //         <Button className="w-32 h-10 mt-2" onClick={handleClearFilter}>Clear Filter</Button>
    //       </div>
    //     </div>
    //     {loader ? (
    //       <Typography>Loading...</Typography>
    //     ) : (
    //       <table className="w-full">
    //         {/* Table headers and rows to display invoices */}
    //       </table>
    //     )}
    //   </CardBody>
    // </Card>
    <></>
  );
};

export default InvoicesManagement;
