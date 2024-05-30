import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FaEdit, FaTrash, FaPrint, FaEye } from 'react-icons/fa';

export function Notifications() {
  const [salarySlips, setSalarySlips] = useState([]);
  const [employeeName, setEmployeeName] = useState('');
  const [employeeID, setEmployeeID] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [basicSalary, setBasicSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');
  const [netSalary, setNetSalary] = useState('');
  const [proofs, setProofs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchSalarySlips = async () => {
      setLoader(true);
      const salarySlipCollection = collection(db, 'salarySlips');
      const salarySlipSnapshot = await getDocs(salarySlipCollection);
      const salarySlipList = salarySlipSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSalarySlips(salarySlipList);
      setLoader(false);
    };

    fetchSalarySlips();
  }, []);

  const handleAddEditSalarySlip = async () => {
    if (!employeeName || !employeeID || !month || !year || !basicSalary || !allowances || !deductions || !netSalary) {
      setError('All fields must be filled out');
      return;
    }

    setLoader(true);
    const newSalarySlip = { employeeName, employeeID, month, year, basicSalary, allowances, deductions, netSalary, proofs };
    setError('');

    if (editIndex !== null) {
      const salarySlipDoc = doc(db, 'salarySlips', salarySlips[editIndex].id);
      await updateDoc(salarySlipDoc, newSalarySlip);
      const updatedSalarySlips = salarySlips.map((slip, index) =>
        index === editIndex ? { ...slip, ...newSalarySlip } : slip
      );
      setSalarySlips(updatedSalarySlips);
      setEditIndex(null);
    } else {
      const docRef = await addDoc(collection(db, 'salarySlips'), newSalarySlip);
      setSalarySlips([...salarySlips, { ...newSalarySlip, id: docRef.id }]);
    }
    setLoader(false);
    setEmployeeName('');
    setEmployeeID('');
    setMonth('');
    setYear('');
    setBasicSalary('');
    setAllowances('');
    setDeductions('');
    setNetSalary('');
    setProofs([]);
    setOpenDialog(false);
  };

  const handleEdit = (index) => {
    const salarySlip = salarySlips[index];
    setEmployeeName(salarySlip.employeeName);
    setEmployeeID(salarySlip.employeeID);
    setMonth(salarySlip.month);
    setYear(salarySlip.year);
    setBasicSalary(salarySlip.basicSalary);
    setAllowances(salarySlip.allowances);
    setDeductions(salarySlip.deductions);
    setNetSalary(salarySlip.netSalary);
    setProofs(salarySlip.proofs || []);
    setEditIndex(index);
    setOpenDialog(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const salarySlipDoc = doc(db, 'salarySlips', salarySlips[index].id);
    await deleteDoc(salarySlipDoc);
    const updatedSalarySlips = salarySlips.filter((_, i) => i !== index);
    setSalarySlips(updatedSalarySlips);
    setLoader(false);
  };

  const handlePrint = (index) => {
    const salarySlip = salarySlips[index];
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<html><head><title>Salary Slip</title></head><body>`);
    printWindow.document.write(`<h1>Salary Slip</h1>`);
    printWindow.document.write(`<p>Employee Name: ${salarySlip.employeeName}</p>`);
    printWindow.document.write(`<p>Employee ID: ${salarySlip.employeeID}</p>`);
    printWindow.document.write(`<p>Month: ${salarySlip.month}</p>`);
    printWindow.document.write(`<p>Year: ${salarySlip.year}</p>`);
    printWindow.document.write(`<p>Basic Salary: ${salarySlip.basicSalary}</p>`);
    printWindow.document.write(`<p>Allowances: ${salarySlip.allowances}</p>`);
    printWindow.document.write(`<p>Deductions: ${salarySlip.deductions}</p>`);
    printWindow.document.write(`<p>Net Salary: ${salarySlip.netSalary}</p>`);
    // if (salarySlip.proofs && salarySlip.proofs.length > 0) {
    //   printWindow.document.write(`<h2>Proofs</h2>`);
    //   salarySlip.proofs.forEach((proof, index) => {
    //     printWindow.document.write(`<p>${index + 1}. ${proof}</p>`);
    //   });
    // }
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(file => file.name); // Extract file names or other relevant information
    setProofs(fileNames); // Update state with extracted information
  };

  const handleDeleteProof = (index) => {
    const updatedProofs = proofs.filter((_, i) => i !== index);
    setProofs(updatedProofs);
  };

  return (
    <Card>
      <Typography variant="h5" className='m-3'>Salary Slips</Typography>
      <CardBody className='overflow-y-hidden'>
        <Button className="mb-4" onClick={() => setOpenDialog(true)}>Add Salary Slip</Button>
        {loader ? (
          <Typography>Loading...</Typography>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left">Employee Name</th>
                <th className="px-6 py-3 text-left">Employee ID</th>
                <th className="px-6 py-3 text-left">Month</th>
                <th className="px-6 py-3 text-left">Year</th>
                <th className="px-6 py-3 text-left">Basic Salary</th>
                <th className="px-6 py-3 text-left">Allowances</th>
                <th className="px-6 py-3 text-left">Deductions</th>
                <th className="px-6 py-3 text-left">Net Salary</th>
                <th className="px-6 py-3 text-left">Proofs</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {salarySlips.map((slip, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-6 py-4">{slip.employeeName}</td>
                  <td className="px-6 py-4">{slip.employeeID}</td>
                  <td className="px-6 py-4">{slip.month}</td>
                  <td className="px-6 py-4">{slip.year}</td>
                  <td className="px-6 py-4">{slip.basicSalary}</td>
                  <td className="px-6 py-4">{slip.allowances}</td>
                  <td className="px-6 py-4">{slip.deductions}</td>
                  <td className="px-6 py-4">{slip.netSalary}</td>
                  <td className="px-6 py-4">
                    {slip.proofs && slip.proofs.length > 0 ? (
                      <ul className='flex'>
                        {slip.proofs.map((proof, proofIndex) => (
                          <li key={proofIndex}>
                            
                              <FaEye className="mr-2"  onClick={() => window.open(proof, '_blank')}/> View Proof
                             
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No Proofs'
                    )}
                  </td>
                  <td className="px-6 py-4 flex">
                    <FaEdit color='green' className='mr-5 cursor-pointer' onClick={() => handleEdit(index)} />
                    <FaTrash color='red' className='mr-5 cursor-pointer' onClick={() => handleDelete(index)} />
                    <FaPrint color='blue' className='cursor-pointer' onClick={() => handlePrint(index)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>

      <Dialog open={openDialog} handler={setOpenDialog}>
        <DialogHeader>{editIndex !== null ? 'Edit Salary Slip' : 'Add Salary Slip'}</DialogHeader>
        <DialogBody>
          {error && <Typography color="red">{error}</Typography>}
          <div className='flex gap-10 m-3'>
          <Input label="Employee Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
          <Input label="Employee ID" value={employeeID} onChange={(e) => setEmployeeID(e.target.value)} />
          </div>
          <div className='flex gap-10 m-3'>
          <Input label="Month" value={month} onChange={(e) => setMonth(e.target.value)} />
          <Input label="Year" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className='flex gap-10 m-3'> 
          <Input label="Basic Salary" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} />
          <Input label="Allowances" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
          </div>
          <div className='flex gap-10 m-3'>
          <Input label="Deductions" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
          <Input label="Net Salary" value={netSalary} onChange={(e) => setNetSalary(e.target.value)} />
          </div>
          <input type="file" multiple onChange={handleFileChange} className="my-4" />
          <Typography>Uploaded Proofs:</Typography>
          {proofs.length > 0 ? (
            <ul>
              {proofs.map((proof, index) => (
                <li key={index}>
                  {proof} <FaTrash color='red' className='cursor-pointer inline' onClick={() => handleDeleteProof(index)} />
                </li>
              ))}
            </ul>
          ) : (
            <Typography>No Proofs</Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddEditSalarySlip}>Save</Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}

export default Notifications;
