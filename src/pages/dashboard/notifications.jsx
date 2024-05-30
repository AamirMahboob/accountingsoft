import React, { useState, useEffect } from 'react';
import { Card, CardBody, Typography, Button, Input, Select, Option } from '@material-tailwind/react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
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
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState('');
  const [loader, setLoader] = useState(false);

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
    const newSalarySlip = { employeeName, employeeID, month, year, basicSalary, allowances, deductions, netSalary };
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
    setEditIndex(index);
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
    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card>
      <Typography variant="h5">Salary Slips</Typography>
      <CardBody className='overflow-y-hidden'>
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col">
            <Typography variant="h6">Employee Name</Typography>
            <Input
              type="text"
              label="Employee Name"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Employee ID</Typography>
            <Input
              type="text"
              label="Employee ID"
              value={employeeID}
              onChange={(e) => setEmployeeID(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Month</Typography>
            <Input
              type="text"
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Year</Typography>
            <Input
              type="text"
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>
        <div className="flex space-x-4 mb-4">
          <div className="flex flex-col">
            <Typography variant="h6">Basic Salary</Typography>
            <Input
              type="number"
              label="Basic Salary"
              value={basicSalary}
              onChange={(e) => setBasicSalary(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Allowances</Typography>
            <Input
              type="number"
              label="Allowances"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Deductions</Typography>
            <Input
              type="number"
              label="Deductions"
              value={deductions}
              onChange={(e) => setDeductions(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <Typography variant="h6">Net Salary</Typography>
            <Input
              type="number"
              label="Net Salary"
              value={netSalary}
              onChange={(e) => setNetSalary(e.target.value)}
            />
          </div>
          <Button className="w-32 h-10 mt-6" onClick={handleAddEditSalarySlip}>
            {editIndex !== null ? 'Edit Salary Slip' : 'Add Salary Slip'}
          </Button>
        </div>
        {error && <Typography color="red">{error}</Typography>}
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
                    <Button size="sm" onClick={() => handleEdit(index)}>Edit</Button>
                    <Button size="sm" onClick={() => handleDelete(index)}>Delete</Button>
                    <Button size="sm" onClick={() => handlePrint(index)}>Print</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
};

export default Notifications;
