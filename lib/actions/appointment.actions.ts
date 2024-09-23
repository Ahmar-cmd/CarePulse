"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";
import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
  
} from "../appwrite.config";
import { formatDateTime,parseStringify } from "../utils";
import { Appointment } from "@/types/appwrite.types";

//  CREATE APPOINTMENT
export const createAppointment = async ( appointment: CreateAppointmentParams ) => {
    try {
     const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    );

    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    const scheduledAppointments = (
      appointments.documents as Appointment[]
    ).filter((appointment) => appointment.status === "scheduled");

    const pendingAppointments = (
      appointments.documents as Appointment[]
    ).filter((appointment) => appointment.status === "pending");

    const cancelledAppointments = (
      appointments.documents as Appointment[]
    ).filter((appointment) => appointment.status === "cancelled");

    const data = {
      totalCount: appointments.total,
      scheduledCount: scheduledAppointments.length,
      pendingCount: pendingAppointments.length,
      cancelledCount: cancelledAppointments.length,
      documents: appointments.documents,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async( userId: string, content: string) => {
  try {
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );

    return parseStringify(message);
  }catch (error) {
    console.error("An error occurred while sending sms:", error);
  }
}

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  appointment,
  type,
}: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    );
    if(!updatedAppointment) throw Error;

    const smsMessage = `Greeting from CarePulse. ${type === "schedule" ? 
      `your application has been scheduled for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician}` :
      `your appointment for ${formatDateTime(appointment.schedule!).dateTime} with Dr. ${appointment.primaryPhysician} has been cancelled for the following reason: ${appointment.cancellationReason}`
    }`

    await sendSMSNotification( userId, smsMessage );
    revalidatePath("/admin");
    return parseStringify(updatedAppointment);

  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
  }
};