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
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { FaEdit, FaTrash, FaPrint, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import logo from '../../../public/img/logo.jpeg'
import stamp from '../../../public/img/logo.png';
import prepared from '../../../public/img/amanda.png';
import auth from '../../../public/img/authorize.png'

// Validation schema
const schema = yup.object().shape({
  employeeName: yup.string().required('Employee Name is required'),
  employeeDesignation: yup.string().required('Employee Designation is required'),
  monthYear: yup.string().required('Month and Year are required'),
  basicSalary: yup.number().required('Basic Salary is required'),
  deductions: yup.number().required('Deductions are required'),
  daysWorked: yup.number().required('Days Worked is required'),
  otHours: yup.number().required('OT Hours are required'),
  otRatePerHour: yup.number().required('OT Rate Per Hour is required'),
  loansAdvances: yup.number().required('Loans/Advances are required'),
  foodAllowance: yup.number().required('Food Allowance are required')

});

export function Notifications() {
  const [salarySlips, setSalarySlips] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [loader, setLoader] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const daysWorked = useWatch({ control, name: 'daysWorked' });
  const basicSalary = useWatch({ control, name: 'basicSalary' });
  const otHours = useWatch({ control, name: 'otHours' });
  const otRatePerHour = useWatch({ control, name: 'otRatePerHour' });
  const deductions = useWatch({ control, name: 'deductions' });
  const loansAdvances = useWatch({ control, name: 'loansAdvances' });
  const foodAllowance = useWatch({ control, name: 'foodAllowance' });

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

  useEffect(() => {
    const parseNumber = (value) => isNaN(parseFloat(value)) ? 0 : parseFloat(value);

    const totalOtPayable = parseNumber(otHours) * parseNumber(otRatePerHour);
    const totalBasicPayable = parseNumber(basicSalary);
    const netSalary = totalBasicPayable + totalOtPayable - parseNumber(deductions) - parseNumber(loansAdvances) + parseNumber(foodAllowance);

    console.log({
      otHours: parseNumber(otHours),
      otRatePerHour: parseNumber(otRatePerHour),
      basicSalary: parseNumber(basicSalary),
      deductions: parseNumber(deductions),
      loansAdvances: parseNumber(loansAdvances),
      totalOtPayable,
      totalBasicPayable,
      netSalary
    });

    setValue('totalOtPayable', totalOtPayable);
    setValue('totalBasicPayable', totalBasicPayable);
    setValue('netSalary', netSalary);
  }, [basicSalary, otHours, otRatePerHour, deductions, loansAdvances,foodAllowance, setValue]);

  const handleAddEditSalarySlip = async (data) => {
    setLoader(true);
    let attachmentURLs = [...existingAttachments];

    // Upload new attachments to Firebase Storage and get URLs
    for (const attachment of attachments) {
      const attachmentRef = ref(storage, `attachments/${attachment.name}`);
      const snapshot = await uploadBytes(attachmentRef, attachment);
      const url = await getDownloadURL(snapshot.ref);
      attachmentURLs.push(url);
    }

    const newSalarySlip = {
      ...data,
      attachments: attachmentURLs
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
    setAttachments([]);
    setExistingAttachments([]);
    setOpenDialog(false);
  };

  const handleEdit = (index) => {
    const salarySlip = salarySlips[index];
    reset({
      employeeName: salarySlip.employeeName,
      employeeDesignation: salarySlip.employeeDesignation,
      monthYear: salarySlip.monthYear,
      basicSalary: salarySlip.basicSalary,
      deductions: salarySlip.deductions,
      netSalary: salarySlip.netSalary,
      daysWorked: salarySlip.daysWorked,
      otHours: salarySlip.otHours,
      otRatePerHour: salarySlip.otRatePerHour,
      totalOtPayable: salarySlip.totalOtPayable,
      totalBasicPayable: salarySlip.totalBasicPayable,
      loansAdvances: salarySlip.loansAdvances,
      foodAllowance: salarySlip.foodAllowance,

    });

    setAttachments([]);
    setExistingAttachments(salarySlip.attachments || []);
    setEditIndex(index);
    setOpenDialog(true);
  };

  const handleDelete = async (index) => {
    setLoader(true);
    console.log("akskdaks")
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
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slip</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ccc;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              display: flex;
              justify-content: space-between;
              text-align: center;
              margin-bottom: 20px;
            }
            .header img {
              height: 50px;
            }
            .header h1 {
              font-size: 24px;
              color: #0071c5;
            }
            .details, .deductions {
              margin-top: 20px;
            }
            .details table, .deductions table {
              width: 100%;
              border-collapse: collapse;
            }
            .details th, .details td, .deductions th, .deductions td {
              border: 1px solid #ccc;
              padding: 8px;
              text-align: left;
            }
            .details th, .deductions th {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 10px;
              display: flex;
              justify-content: space-between;
            }
            .footer img {
              height: 30px;
            }
            .footer p {
              margin: 0;
            }
            .pb{
              display: flex;
              flex-direction: column;
              gap:20px;
            }
             
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img  src="${logo}" alt="Platinum Marine Logo"  width:200px />
              <h1 style="margin-right:150px" class='plat' >PLATINUM MARINE W.L.L.</h1>
              
             
            </div>
            <hr style="margin-top:-10px" />
  
            <h3 style="margin-left:150px;" >Payslip for the month of ${salarySlip.monthYear}</h3>
  
            <div class="details">
              <table>
                <thead>
                  <tr>
                    <th>Employee Details</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Name</td>
                    <td>${salarySlip.employeeName}</td>
                  </tr>
                  <tr>
                    <td>Designation</td>
                    <td>${salarySlip.employeeDesignation}</td>
                  </tr>
                  <tr>
                    <td>Basic Salary</td>
                    <td>${salarySlip.basicSalary}</td>
                  </tr>
                  <tr>
                    <td>Days Worked</td>
                    <td>${salarySlip.daysWorked}</td>
                  </tr>
                  <tr>
                    <td>OT Hours</td>
                    <td>${salarySlip.otHours}</td>
                  </tr>
                  <tr>
                    <td>OT Rate Per Hour</td>
                    <td>${salarySlip.otRatePerHour}</td>
                  </tr>
                  <tr>
                    <td>Food Allowance</td>
                    <td>${salarySlip.foodAllowance}</td>
                  </tr>

                   
                </tbody>
              </table>
            </div>
  
             
            <div style="margin-top:50px" class="deductions">
              <table>
              <thead>
              <tr>
                <th>Deductions</th>
                <th></th>
              </tr>
            </thead>
                <tbody>
                  <tr>
                    <td>Loans/Advances</td>
                    <td>${salarySlip.loansAdvances}</td>
                  </tr>
                  <tr>
                    <td>Total Deductions</td>
                    <td>${salarySlip.deductions}</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <h3 style="margin-top:50px;">Total Salary Payable: ${salarySlip.netSalary}</h3>
  
            <div class="footer">
              <div class='pb'>
              <div>
              <p>Prepared By:</p>
              <img src="${prepared}" alt="Prepared Signature" />
            </div>
            <div>
              <p>Authorized By:</p>
              <img src="${auth}" alt="Authorized Signature" />
            </div>
              </div>
              <div>
                <p style="text-align: center; margin-right:240px">Received By:</p>
              </div>
            </div>
            <div style="text-align: center; margin-top:-80px;">
              <img src="${stamp}" alt="Stamp" width="100px" height="100px" />
            </div>
            <hr style="margin-top:90px"   />
  
            <p style="margin-left:150px;" >Po Box- 51161, Al suqayyah, Kingdom Of Bahrain</p>
  
          </div>
          
        </body>
      </html>
    `);
  
    // Wait for images to load before printing
    const waitForImagesToLoad = () => {
      const images = printWindow.document.images;
      let loadedCount = 0;
      const totalImages = images.length;
  
      const imageLoaded = () => {
        loadedCount += 1;
        if (loadedCount === totalImages) {
          printWindow.print();
          printWindow.close();
        }
      };
  
      for (let img of images) {
        if (img.complete) {
          imageLoaded();
        } else {
          img.addEventListener('load', imageLoaded);
          img.addEventListener('error', imageLoaded);
        }
      }
    };
  
    printWindow.document.close();
    waitForImagesToLoad();
  };
  



  const handleViewImage = (url) => {
    setSelectedAttachment(url);
    setOpenImageDialog(true);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <Typography variant="h4" className="font-bold">
          Salary Slips
        </Typography>
        <Button onClick={() => setOpenDialog(true)}>Add Salary Slip</Button>
      </div>

      {loader ? (
        <div className="flex justify-center items-center">
          <Spinner className="h-12 w-12" />
        </div>
      ) : (
        <Card className='  '>
          <CardBody className='w-full overflow-x-auto'>
            {salarySlips.length === 0 ? (
              <Typography variant="body1">No salary slips found.</Typography>
            ) : (
              <table className="   bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Employee Name</th>
                    <th className="py-2 px-4 border-b">Employee Designation</th>
                    <th className="py-2 px-4 border-b">Month-Year</th>
                    <th className="py-2 px-4 border-b">Basic Salary</th>
                    <th className="py-2 px-4 border-b">Deductions</th>
                    <th className="py-2 px-4 border-b">Net Salary</th>
                    <th className="py-2 px-4 border-b">Attachments</th>

                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salarySlips.map((slip, index) => (
                    <tr key={slip.id}>
                      <td className="py-2 px-4 border-b">{slip.employeeName}</td>
                      <th className="py-2 px-4 border-b">{slip.employeeDesignation}</th>
                      <td className="py-2 px-4 border-b">{slip.monthYear}</td>
                      <td className="py-2 px-4 border-b">{slip.basicSalary}</td>
                      <td className="py-2 px-4 border-b">{slip.deductions}</td>
                      <td className="py-2 px-4 border-b">{slip.netSalary}</td>
                      <td>{slip.attachments.map((url, idx) => (
                        <Button key={idx} variant="text" color="teal" onClick={() => handleViewImage(url)}>
                          <FaEye />
                        </Button>
                      ))}</td>
                      <td className="py-2 px-4 border-b">
                        <div className="flex space-x-2">
                          <Button variant="text" color="blue" onClick={() => handleEdit(index)}>
                            <FaEdit />
                          </Button>
                          <Button variant="text" color="red" onClick={() => handleDelete(index)}>
                            <FaTrash />
                          </Button>
                          <Button variant="text" color="green" onClick={() => handlePrint(index)}>
                            <FaPrint />
                          </Button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      <Dialog open={openDialog} handler={() => setOpenDialog(!openDialog)}>
        <DialogHeader>{editIndex !== null ? 'Edit Salary Slip' : 'Add Salary Slip'}</DialogHeader>
        <DialogBody className='max-h-[70vh] overflow-y-auto'>
          <form onSubmit={handleSubmit(handleAddEditSalarySlip)} encType="multipart/form-data">
            <div className="">
              <div>
                <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700">
                  Employee Name
                </label>
                <Controller
                  name="employeeName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} id="employeeName" />}
                />
                {errors.employeeName && <p className="text-red-500 text-sm">{errors.employeeName.message}</p>}
              </div>
              <div>
                <label htmlFor="employeeDesignation" className="block text-sm font-medium text-gray-700">
                  Employee Designation
                </label>
                <Controller
                  name="employeeDesignation"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} id="employeeDesignation" />}
                />
                {errors.employeeName && <p className="text-red-500 text-sm">{errors.employeeName.message}</p>}
              </div>
              <div>
                <label htmlFor="monthYear" className="block text-sm font-medium text-gray-700">
                  Month and Year
                </label>
                <Controller
                  name="monthYear"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input {...field} id="monthYear" />}
                />
                {errors.monthYear && <p className="text-red-500 text-sm">{errors.monthYear.message}</p>}
              </div>
              <div >
                <div>
                  <label htmlFor="basicSalary" className="block text-sm font-medium text-gray-700">
                    Basic Salary
                  </label>
                  <Controller
                    name="basicSalary"
                    control={control}
                    defaultValue=""
                    render={({ field }) => <Input type="number" {...field} id="basicSalary" />}
                  />
                  {errors.basicSalary && <p className="text-red-500 text-sm">{errors.basicSalary.message}</p>}
                </div>
                <div>
                  <label htmlFor="deductions" className="block text-sm font-medium text-gray-700">
                    Deductions
                  </label>
                  <Controller
                    name="deductions"
                    control={control}
                    defaultValue=""
                    render={({ field }) => <Input type="number" {...field} id="deductions" />}
                  />
                  {errors.deductions && <p className="text-red-500 text-sm">{errors.deductions.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="daysWorked" className="block text-sm font-medium text-gray-700">
                  Days Worked
                </label>
                <Controller
                  name="daysWorked"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input type="number" {...field} id="daysWorked" />}
                />
                {errors.daysWorked && <p className="text-red-500 text-sm">{errors.daysWorked.message}</p>}
              </div>
              <div>
                <label htmlFor="otHours" className="block text-sm font-medium text-gray-700">
                  OT Hours
                </label>
                <Controller
                  name="otHours"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input type="number" {...field} id="otHours" />}
                />
                {errors.otHours && <p className="text-red-500 text-sm">{errors.otHours.message}</p>}
              </div>
              <div>
                <label htmlFor="otRatePerHour" className="block text-sm font-medium text-gray-700">
                  OT Rate Per Hour
                </label>
                <Controller
                  name="otRatePerHour"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input type="number" {...field} id="otRatePerHour" />}
                />
                {errors.otRatePerHour && <p className="text-red-500 text-sm">{errors.otRatePerHour.message}</p>}
              </div>
              <div>
                <label htmlFor="loansAdvances" className="block text-sm font-medium text-gray-700">
                  Loans/Advances
                </label>
                <Controller
                  name="loansAdvances"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input type="number" {...field} id="loansAdvances" />}
                />
                {errors.loansAdvances && <p className="text-red-500 text-sm">{errors.loansAdvances.message}</p>}
              </div>
              <div>
                <label htmlFor="foodAllowance" className="block text-sm font-medium text-gray-700">
                  Food Allowance
                </label>
                <Controller
                  name="foodAllowance"
                  control={control}
                  defaultValue=""
                  render={({ field }) => <Input type="number" {...field} id="foodAllowance" />}
                />
                {errors.foodAllowance && <p className="text-red-500 text-sm">{errors.foodAllowance.message}</p>}
              </div>
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                  Attachments
                </label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files.length > 2) {
                      toast.error('You can only upload a maximum of 2 files');
                      e.target.value = null;
                    } else {
                      setAttachments([...e.target.files]);
                    }
                  }}
                />
                <div>
                  {existingAttachments.map((url, index) => (
                    <div key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="text"
                color="blue"
                onClick={() => setOpenDialog(false)}

              >
                Cancel
              </Button>
              <Button type="submit" color="blue" className="bg-black text-white">
                {loader ? <Spinner className="h-4 w-4 bg-black" /> : editIndex !== null ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogBody>
      </Dialog>

      <Dialog open={openImageDialog} handler={() => setOpenImageDialog(!openImageDialog)}>
        <DialogHeader>Attachment</DialogHeader>
        <DialogBody>
          {selectedAttachment && (
            <img
              src={selectedAttachment}
              alt="Attachment"
              className="w-full h-auto"
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="blue"
            onClick={() => setOpenImageDialog(false)}
            className="bg-black text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default Notifications;
