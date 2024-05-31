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
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { FaEdit, FaTrash, FaPrint, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Validation schema
const schema = yup.object().shape({
  employeeName: yup.string().required('Employee Name is required'),
  employeeID: yup.string().required('Employee ID is required'),
  month: yup.string().required('Month is required'),
  year: yup.string().required('Year is required'),
  basicSalary: yup.number().required('Basic Salary is required'),
  allowances: yup.number().required('Allowances are required'),
  deductions: yup.number().required('Deductions are required'),
  netSalary: yup.number().required('Net Salary is required'),
});

export function Notifications() {
  const [salarySlips, setSalarySlips] = useState([]);
  const [proofs, setProofs] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loader, setLoader] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedProof, setSelectedProof] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

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

  const handleAddEditSalarySlip = async (data) => {
    setLoader(true);
    let proofURLs = [];

    // Upload proofs to Firebase Storage and get URLs
    for (const proof of proofs) {
      const proofRef = ref(storage, `proofs/${proof.name}`);
      const snapshot = await uploadBytes(proofRef, proof);
      const url = await getDownloadURL(snapshot.ref);
      proofURLs.push(url);
    }

    const newSalarySlip = {
      ...data,
      proofs: proofURLs
    };

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
    toast.success("Added Successfully")
    setLoader(false);
    reset();
    setProofs([]);
    setOpenDialog(false);
  };

  const handleEdit = (index) => {
    const salarySlip = salarySlips[index];
    reset({
      employeeName: salarySlip.employeeName,
      employeeID: salarySlip.employeeID,
      month: salarySlip.month,
      year: salarySlip.year,
      basicSalary: salarySlip.basicSalary,
      allowances: salarySlip.allowances,
      deductions: salarySlip.deductions,
      netSalary: salarySlip.netSalary,
    });
    toast.success("Update Successfully")
    setProofs([]);
    setEditIndex(index);
    setOpenDialog(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const salarySlipDoc = doc(db, 'salarySlips', salarySlips[index].id);
    await deleteDoc(salarySlipDoc);
    const updatedSalarySlips = salarySlips.filter((_, i) => i !== index);
    setSalarySlips(updatedSalarySlips);
    toast.success("Deleted Successfully")
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

  const handleFileChange = (e) => {
    setProofs(e.target.files);
  };

  const handleDeleteProof = (index) => {
    const updatedProofs = Array.from(proofs).filter((_, i) => i !== index);
    setProofs(updatedProofs);
  };

  const handleViewProof = (url) => {
    setSelectedProof(url);
    setOpenImageDialog(true);
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
                <th className="px-6 py-3 text-left ">Proofs</th>
                <th className="px-6 py-3">Actions</th>
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
                      slip.proofs.map((proof, proofIndex) => (
                        <div  key={proofIndex} className='flex'>
                          <span className='cursor-pointer ' onClick={() => handleViewProof(proof)} >
                            Proof {proofIndex + 1}
                            </span > 
                        </div>
                      ))
                    ) : (
                      <p>No proof</p>
                    )}
                  </td>
                  <td className="flex gap-4  px-6 py-4 text-right">

                    <FaEdit color="blue-gray" size={20} onClick={() => handleEdit(index)} />

                    <FaTrash color="red" size={20} onClick={() => handleDelete(index)} />

                    <FaPrint color="blue-gray" size={20} onClick={() => handlePrint(index)} />

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Dialog open={openDialog} handler={setOpenDialog}>
          <DialogHeader>{editIndex !== null ? 'Edit Salary Slip' : 'Add Salary Slip'}</DialogHeader>
          <DialogBody divider>
            <form onSubmit={handleSubmit(handleAddEditSalarySlip)}>
              <div className="space-y-4">
                <div className='flex gap-3'>
                  <Controller
                    name="employeeName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Employee Name"
                        {...field}
                        error={!!errors.employeeName}
                        helperText={errors.employeeName?.message}
                      />
                    )}
                  />
                  <Controller
                    name="employeeID"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Employee ID"
                        {...field}
                        error={!!errors.employeeID}
                        helperText={errors.employeeID?.message}
                      />
                    )}
                  />
                </div>
                <div className='flex gap-3'>
                  <Controller
                    name="month"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Month"
                        {...field}
                        error={!!errors.month}
                        helperText={errors.month?.message}
                      />
                    )}
                  />
                  <Controller
                    name="year"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Year"
                        {...field}
                        error={!!errors.year}
                        helperText={errors.year?.message}
                      />
                    )}
                  />
                </div>
                <div className='flex gap-3'>
                  <Controller
                    name="basicSalary"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Basic Salary"
                        {...field}
                        error={!!errors.basicSalary}
                        helperText={errors.basicSalary?.message}
                      />
                    )}
                  />
                  <Controller
                    name="allowances"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Allowances"
                        {...field}
                        error={!!errors.allowances}
                        helperText={errors.allowances?.message}
                      />
                    )}
                  />
                </div>
                <div className='flex gap-3'>
                  <Controller
                    name="deductions"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Deductions"
                        {...field}
                        error={!!errors.deductions}
                        helperText={errors.deductions?.message}
                      />
                    )}
                  />
                  <Controller
                    name="netSalary"
                    control={control}
                    render={({ field }) => (
                      <Input
                        label="Net Salary"
                        {...field}
                        error={!!errors.netSalary}
                        helperText={errors.netSalary?.message}
                      />
                    )}
                  />
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-4"
                />
                <div>
                  {Array.from(proofs).map((proof, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Typography>{proof.name}</Typography>
                      <Button onClick={() => handleDeleteProof(index)}>Delete</Button>
                    </div>
                  ))}
                </div>
              </div>
              {errors && (
                <Typography className="text-red-500">
                  {Object.values(errors).map((error, index) => (
                    <div key={index}>{error.message}</div>
                  ))}
                </Typography>
              )}
              <DialogFooter>
                <Button variant="text" color="red" onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button variant="gradient" color="green" type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogBody>
        </Dialog>
        <Dialog open={openImageDialog} handler={setOpenImageDialog}>
          <DialogHeader>Proof Image</DialogHeader>
          <DialogBody divider>
            {selectedProof && (
              <img src={selectedProof} alt="Proof" className="w-52 " />
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="gradient" color="green" onClick={() => setOpenImageDialog(false)}>Close</Button>
          </DialogFooter>
        </Dialog>
      </CardBody>
    </Card>
  );
}
