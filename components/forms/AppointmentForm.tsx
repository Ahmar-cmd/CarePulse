"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import { getAppointmentSchema} from "@/lib/validation"

import "react-phone-number-input/style.css";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { FormFieldType } from "./PatientForm";
import { Doctors } from "@/constants";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";


export const AppointmentForm = ({
    type,
    userId,
    patientId,
    appointment,
    setOpen,
 }:{
    userId: string;
    patientId: string;
    type: "create" | "schedule" | "cancel";
    appointment?: Appointment;
    setOpen?: (open: boolean) => void
 }
 ) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentFormValidation = getAppointmentSchema(type);
  // console.log(appointment)
  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
     primaryPhysician: appointment? appointment.primaryPhysician : "",
     schedule: appointment? new Date(appointment.schedule) : new Date(Date.now()),
     reason: appointment? appointment.reason : "",
     note: appointment?.note || "",
     cancellationReason: appointment?.cancellationReason || "",
    },
  });




const onSubmit = async (values: z.infer<typeof AppointmentFormValidation>) => {
    setIsLoading(true);
    let status;
    switch (type) {
      case "schedule":
        status = "scheduled"
        break;
        case "cancel":
        status = "cancelled"
          break;        
          default:
        status = "pending"
            break;
          }
          try {
            if (type === "create" && patientId ) {
                const appointmentData = {
                    userId,
                    patient: patientId,
                    status: status as Status,
                    primaryPhysician: values.primaryPhysician,
                    schedule: new Date(values.schedule),
                    reason: values.reason!,
                    note: values.note,
                }
                const appointment = await createAppointment(appointmentData);
                // console.log(appointment)
                if (appointment) {
                    console.log("form submitted")     
                    form.reset();
                    router.push(
                        `/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`
                  )
                }
         } else {
          const appointmentToUpdate = {
            userId,
            appointmentId: appointment?.$id!,
            type,
            appointment: {
              primaryPhysician: values.primaryPhysician,
              schedule: new Date(values.schedule),
              status: status as Status,
              cancellationReason: values.cancellationReason,
            },
          };

           const updatedAppointment = await updateAppointment(appointmentToUpdate);
           
           if(updatedAppointment){
            setOpen && setOpen(false);
            form.reset();
           }
         }
        } catch (error) {
          console.log(error);
        }
        setIsLoading(false);
  };


  let buttonLabel;

  switch (type) {
    case "create":
      buttonLabel = 'create appointment'
        break;
    case "cancel":
      buttonLabel = 'cancel appointment'
        break;
    case "schedule":
      buttonLabel = 'schedule appointment'
        break;
    default:
        break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
      {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">
              Request a new appointment in 10 seconds.
            </p>
          </section>
        )}

        { type !== "cancel" && (
        <>
            <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="primaryPhysician"
            label="doctor"
            placeholder="Select a doctor"
            >
            {Doctors.map((doctor, i) => (
              <SelectItem key={doctor.name + i} value={doctor.name}>
                <div className="flex cursor-pointer items-center gap-2">
                  <Image
                    src={doctor.image}
                    width={32}
                    height={32}
                    alt="doctor"
                    className="rounded-full border border-dark-500"
                  />
                  <p>{doctor.name}</p>
                </div>
              </SelectItem>
            ))}
            </CustomFormField>
          <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Expected appointment date"
              dateFormat="MM/dd/yyyy - h:mm aa"
              showTimeSelect
            />

            <div className="flex flex-col gap-6 xl:flex-row">
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="reason"
              label="reason for appointment"
              placeholder="Enter reason for appointment"
            />

            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="note"
              label="notes"
              placeholder="Enter notes"
            />
            </div>

        </>
        )}

        {type === "cancel" && (
            
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="cancellationReason"
              label="Reason for cancellation"
              placeholder="Urgent meeting came up"
            />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
          >
            {buttonLabel}
          </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm