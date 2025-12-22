import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  Tooltip,
  IconButton
} from "@mui/material";
import { useState } from "react";
import CustomPagination from "../common/pagination";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Pencil,
  Trash2,
  Eye 
} from "lucide-react";
import ApproveRejectProperty from "../common/approveReject/approveRejectProperty";
import { PROPERTY_STATUS } from "../../lib/enums";
import { deletePropertyApiHandler } from "../../services/postProperty";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";


export default function PropertiesTable({propertyList, propertyData, fetchPropertyList, pagination, setPagination}) {
     console.log('sdfjsdfsd', propertyData,propertyList)
     const [approvePopup, setApprovePopup] = useState(false)
     const [popupType, setPopupType] = useState('')
     const [propertyId, setPropertyId] = useState(null)

 const handlePagination = (value) => {
    setPagination((pre) => ({...pre, page: value}))
  }

  const handleOpenStatusPopup = (type, id) => {
    setApprovePopup(true)
    setPopupType(type)
    setPropertyId(id)
  }

  const closePopup = (isRefetch) => {
    setApprovePopup(false)
    setPopupType('')

    if(isRefetch){
        fetchPropertyList()
    }
  }

  const {mutate: deleteProperty, isPending: deleteLoader} = useMutation({
    mutationFn: deletePropertyApiHandler,
    onSuccess: (res) => {
        toast.success(res.message)
        fetchPropertyList()
    },
    onError: (error) => {
if(Array.isArray(error.message)){
        error.message.map((item) => {
          toast.error(item)
        })
      }else{
        toast.error(error.message)
      }
    }
  })

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Properties List
      </Typography>

     <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-100">
              {["#ID", "Name", "category", "Type", "Built Up Area", 'status', 'Action'].map(
                (head) => (
                  <TableCell
                    key={head}
                    className="font-semibold text-gray-700 whitespace-nowrap"
                    {...{ align: head == "Action" ? "right" : "left" }}
                  >
                    {head}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {propertyList?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.society?.name ?? '-'}</TableCell>
                <TableCell>{row.category?.name ?? '-'}</TableCell>
                <TableCell>{row.listingType?.name}</TableCell>
                <TableCell>{row.builtUpArea + ' ' + row.builtUpAreaUnit}</TableCell>
                <TableCell>{PROPERTY_STATUS.find(item => item.value == row.status)?.name ?? '-'}</TableCell>
                <TableCell className="flex gap-2">
  {row.status != 'approved' && <Tooltip title="Approve">
    <IconButton
      onClick={() => handleOpenStatusPopup("approve", row.id)}
    >
      <CheckCircle size={18} />
    </IconButton>
  </Tooltip>}

  {row.status != 'rejected' && <Tooltip title="Reject">
    <IconButton
      onClick={() => handleOpenStatusPopup("reject", row.id)}
    >
      <XCircle size={18} />
    </IconButton>
  </Tooltip>}

  <Tooltip title="Edit">
    <Link to={`/properties/${row.id}`}>
      <IconButton>
        <Pencil size={18} />
      </IconButton>
    </Link>
  </Tooltip>
  <Tooltip title="View">
    <Link to={`/properties/view/${row.id}`}>
      <IconButton>
        <Eye size={18} />
      </IconButton>
    </Link>
  </Tooltip>

  <Tooltip title="Delete">  
    <IconButton
      onClick={() => deleteProperty(row.id)}
    >
      <Trash2 size={18} />
    </IconButton>
  </Tooltip>
</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Stack alignItems="center" sx={{ mt: 3 }}>
        <CustomPagination page={pagination.page} totalPages={pagination.totalPage} onChange={(value) => handlePagination(value)}/>
      </Stack>
      <ApproveRejectProperty open={approvePopup} popupType={popupType} onClose={closePopup} propertyId={propertyId}/>
    </Paper>
  );
}
