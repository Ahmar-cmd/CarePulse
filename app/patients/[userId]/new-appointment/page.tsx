import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { getPatient } from "@/lib/actions/patient.actions";
import Image from "next/image";


export default async function NewAppointment({ params: {userId} }: SearchParamProps) {
  const patient = await getPatient(userId);
     
    
  return (
     <div className="remove-scrollbar flex h-screen max-h-screen">
       <section className="container my-auto">
         <div className="sub-container max-w-[860px] flex-1 justify-between">
           <Image 
             src='/assets/icons/logo-full.svg'
             alt="patient"
             height={1000}
             width={1000}
             className="mb-12 h-10 w-fit"
             />

             <AppointmentForm
              type="create"
              userId={userId}
              patientId={patient.documents[0].$id}

              />
             
              <p className="copyright py-4">
               © 2024 CarePulse
              </p>
               
         </div>
       </section>

       <Image
         src="/assets/images/appointment-img.png"
         height={1000}
         width={1000}
         alt="appointment"
         className="side-img max-w-[380px] bg-bottom"
         />
     </div>
  );
}