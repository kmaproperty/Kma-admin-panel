
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import AddButton from "../common/addButton";
import CustomDialog from "../common/CustomDialog";
import MainWrapper from "../common/layout/mainWrapper";
import PageTitle from "../common/layout/PageTitle";
import CustomDataGrid from "../common/CustomDataGrid";
import { deleteAboutusmasterConfiguration, fetchAboutus } from "../../services/aboutUsMaster";
import AboutsusDialog from "./aboutsUsDialog";

export default function AboutUsData() {
  const [aboutusData, setAboutusData] = useState([])
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleDelete = async () => {
    handelDeleteAboutusData(confirmationDialog)
  }
  const handleClose = () => {
    setConfirmationDialog(null);
  }

  const confirmationDialogActions = [
    {
      label: 'Delete',
      variant: 'danger',
      onClick: () => {
        handleDelete()
      }
    },
    {
      label: 'Close',
      variant: 'outline-secondary',
      onClick: handleClose
    },
  ];


  const { mutate: fetchAboutusData, isPending } = useMutation({
    mutationFn: fetchAboutus,
    onSuccess: (data) => {
      console.log('data', data)
      setAboutusData(data?.data ?? [])

    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { mutate: handelDeleteAboutusData, isPending: deleteLoader } = useMutation(
    {
      mutationFn: deleteAboutusmasterConfiguration,
      onSuccess: () => {
        fetchAboutusData()
        setConfirmationDialog(null);
      },
      onError: (error) => {
        if (Array.isArray(error.message)) {
          error.message.map((item) => {
            toast.error(item);
          });
        } else {
          toast.error(error.message);
        }
      },
    }
  );

  useEffect(() => {
    fetchAboutusData()
  },[])


  return (
    <MainWrapper>
      <div className="p-6 w-fit rounded-2xl">
        <PageTitle title={"Master Configuration"} />
        <div className="flex gap-6 py-3 border-b border-gray-300 justify-between items-center">
          <p className="text-sm font-semibold text-gray-500">Mobile Application Available:</p>
          <p className="text-sm text-gray-800">{aboutusData?.mobileAppAvailable ? 'Yes' : 'No'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Address:</p>
          <p className="text-sm text-gray-800">{aboutusData?.address ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Description:</p>
          <p className="text-sm text-gray-800">{aboutusData?.description ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Phone Number:</p>
          <p className="text-sm text-gray-800">{aboutusData?.phoneNumber ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Email Address:</p>
          <p className="text-sm text-gray-800">{aboutusData?.email ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Latitude:</p>
          <p className="text-sm text-gray-800">{aboutusData?.latitude ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Longitude:</p>
          <p className="text-sm text-gray-800">{aboutusData?.longitude ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Instagram Link:</p>
          <p className="text-sm text-gray-800">{aboutusData?.instagramLink ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Facebook Link:</p>
          <p className="text-sm text-gray-800">{aboutusData?.fbLink ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Twitter Link:</p>
          <p className="text-sm text-gray-800">{aboutusData?.twitterLink ?? '-'}</p>
        </div>

        <div className="flex gap-6 items-center py-3 border-b border-gray-300 justify-between">
          <p className="text-sm font-semibold text-gray-500">Youtube Link:</p>
          <p className="text-sm text-gray-800">{aboutusData?.youtubeLink ?? '-'}</p>
        </div>
        
        <div className="mt-4 flex items-center py-3 gap-6">
          <button onClick={() => {
            setConfirmationDialog(aboutusData?.id)
          }} type="button" className="w-fit px-6 bg-red-600 text-white py-2
                      rounded-lg font-medium cursor-pointer
                      hover:bg-red-700
                      disabled:opacity-60
                      transition">Delete</button>
        <button
          onClick={() => {
            setOpenPopup(true)
            setEditId(aboutusData?.id)
          }}
              type="button"
              className="w-fit px-6 bg-indigo-600 text-white py-2
                      rounded-lg font-medium cursor-pointer
                      hover:bg-indigo-700
                      disabled:opacity-60
                      transition"
            >
              {aboutusData?.id ? 'Edit' : 'Create'}
            </button>

        </div>
        <CustomDialog
          open={confirmationDialog ? true : false}
          handleClose={handleClose}
          heading={`Confirm delete Society`}
          actions={confirmationDialogActions}
          size='sm'
        >
          <div className="mb-3">
            <p>Are you sure you want to delete this Society?</p>
          </div>
        </CustomDialog>
        {openPopup && (
          <AboutsusDialog
            open={openPopup}
            aboutusId={editId}
            onClose={(isUpdate) => {
              setEditId(null);
              setOpenPopup(false);
              if (isUpdate) {
                fetchAboutusData();
              }
            }}
          />
        )}
      </div>
    </MainWrapper>
  );
}
