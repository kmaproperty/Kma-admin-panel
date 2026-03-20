import React from 'react'
import PageTitle from '../../components/common/layout/PageTitle'
import { useQueryClient } from '@tanstack/react-query';
import { channelPartnersDetailsApiHandler } from '../../services/channelPartnerService';
import { useParams } from 'react-router-dom';

const ViewChannelPartner = () => {
    const params = useParams()
    const { data: channelPartnerDetails, refetch: refetchDetails } = useQueryClient({
        queryKey: ["partner-details", params?.id],
        queryFn: async () => {
            return channelPartnersDetailsApiHandler(String(params?.id ?? ''));
        },
        select: (resposne) => {
            console.log('partner details', resposne)
            return resposne.data
        },
        enabled: params?.propertyId ? true : false,
        staleTime: 0,
        refetchOnMount: true
    });
    return (
        <div className="pl-6 py-3 pb-8 flex justify-start gap-3 flex-col ">
            <PageTitle title="Channel Partner Overview" />
        </div>
    )
}

export default ViewChannelPartner