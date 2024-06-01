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
  Spinner,
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
  const [existingProofs, setExistingProofs] = useState([]);
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
    let proofURLs = [...existingProofs];

    // Upload new proofs to Firebase Storage and get URLs
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
      toast.success("Updated Successfully");
    } else {
      const docRef = await addDoc(collection(db, 'salarySlips'), newSalarySlip);
      setSalarySlips([...salarySlips, { ...newSalarySlip, id: docRef.id }]);
      toast.success("Added Successfully");
    }
    
    setLoader(false);
    reset();
    setProofs([]);
    setExistingProofs([]);
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
    
    setProofs([]);
    setExistingProofs(salarySlip.proofs || []);
    setEditIndex(index);
    setOpenDialog(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    const salarySlipDoc = doc(db, 'salarySlips', salarySlips[index].id);
    await deleteDoc(salarySlipDoc);
    const updatedSalarySlips = salarySlips.filter((_, i) => i !== index);
    setSalarySlips(updatedSalarySlips);
    toast.success("Deleted Successfully");
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

  const handleDeleteExistingProof = (index) => {
    const updatedExistingProofs = existingProofs.filter((_, i) => i !== index);
    setExistingProofs(updatedExistingProofs);
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
                <th className="px-6 py-3 text-left">Proofs</th>
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
                        // <FaEye key={proofIndex} className="cursor-pointer mx-1" onClick={() => handleViewProof(proof)} />
                        <span key={proofIndex} className="cursor-pointer mx-1 flex " onClick={() => handleViewProof(proof)}>
                          Proof {proofIndex + 1}
                        </span>

                      ))
                    ) : (
                      <Typography>No proof</Typography>
                    )}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <FaEdit color="blue-gray" className='cursor-pointer' onClick={() => handleEdit(index)} />
                    <FaTrash color="red" className='cursor-pointer' onClick={() => handleDelete(index)} />
                    <FaPrint color="blue-gray" className='cursor-pointer' onClick={() => handlePrint(index)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardBody>

      {/* Dialog for Add/Edit Salary Slip */}
      <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)} size="lg">
        <DialogHeader>{editIndex !== null ? 'Edit' : 'Add'} Salary Slip</DialogHeader>
        <DialogBody divider>
          <form onSubmit={handleSubmit(handleAddEditSalarySlip)} className="grid grid-cols-2 gap-4">
            <Controller
              name="employeeName"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Employee Name"
                  error={errors.employeeName ? true : false}
                  helperText={errors.employeeName?.message}
                />
              )}
            />
            <Controller
              name="employeeID"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Employee ID"
                  error={errors.employeeID ? true : false}
                  helperText={errors.employeeID?.message}
                />
              )}
            />
            <Controller
              name="month"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Month"
                  error={errors.month ? true : false}
                  helperText={errors.month?.message}
                />
              )}
            />
            <Controller
              name="year"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Year"
                  error={errors.year ? true : false}
                  helperText={errors.year?.message}
                />
              )}
            />
            <Controller
              name="basicSalary"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Basic Salary"
                  type="number"
                  error={errors.basicSalary ? true : false}
                  helperText={errors.basicSalary?.message}
                />
              )}
            />
            <Controller
              name="allowances"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Allowances"
                  type="number"
                  error={errors.allowances ? true : false}
                  helperText={errors.allowances?.message}
                />
              )}
            />
            <Controller
              name="deductions"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Deductions"
                  type="number"
                  error={errors.deductions ? true : false}
                  helperText={errors.deductions?.message}
                />
              )}
            />
            <Controller
              name="netSalary"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Input
                  {...field}
                  label="Net Salary"
                  type="number"
                  error={errors.netSalary ? true : false}
                  helperText={errors.netSalary?.message}
                />
              )}
            />
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="col-span-2"
            />
            {existingProofs.length > 0 && (
              <div className="col-span-2">
                <Typography>Existing Proofs:</Typography>
                {existingProofs.map((proof, index) => (
                  <div key={index} className="flex justify-between">
                    <Typography className="cursor-pointer" onClick={() => handleViewProof(proof)}>{proof}</Typography>
                    <FaTrash className="cursor-pointer" onClick={() => handleDeleteExistingProof(index)} />
                  </div>
                ))}
              </div>
            )}
            {proofs.length > 0 && (
              <div className="col-span-2">
                <Typography>New Proofs:</Typography>
                {Array.from(proofs).map((proof, index) => (
                  <div key={index} className="flex justify-between">
                    <Typography>{proof.name}</Typography>
                    <FaTrash className="cursor-pointer" onClick={() => handleDeleteProof(index)} />
                  </div>
                ))}
              </div>
            )}
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => setOpenDialog(!openDialog)}
            variant="text"
            color="red"
            className="mr-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(handleAddEditSalarySlip)}
            variant="gradient"
            color="green"
            disabled={loader}
          >
            {loader ? <Spinner /> : 'Save'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Dialog for Viewing Proof */}
      <Dialog open={openImageDialog} handler={() => setOpenImageDialog(!openImageDialog)} size="lg">
        <DialogHeader>Proof</DialogHeader>
        <DialogBody divider>
          {selectedProof ? (
            <img src={selectedProof} alt="Proof" className='w-52 ' />
          ) : (
            <Typography>No proof available</Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpenImageDialog(!openImageDialog)} variant="gradient" color="green">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </Card>
  );
}
