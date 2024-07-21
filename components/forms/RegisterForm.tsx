"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import Image from "next/image";

import {Form, FormControl} from "@/components/ui/form";
import {registerPatient} from "@/lib/actions/patient.actions";
import {PatientFormValidation} from "@/lib/validation";

import "react-phone-number-input/style.css";
import CustomFormField, {FormFieldType} from "../CustomFormField";
import {Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues} from "@/constants";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Label} from "@/components/ui/label";
import {SelectItem} from "@/components/ui/select";
import SubmitButton from "@/components/SubmitButton";
import {FileUploader} from "@/components/FileUploader";

export const RegisterForm = ({user}: User) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof PatientFormValidation>>({
        resolver: zodResolver(PatientFormValidation),
        defaultValues: {
            ...PatientFormDefaultValues,
            name: "",
            email: "",
            phone: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof PatientFormValidation>) => {
        setIsLoading(true);
        let formData;

        if (values.identificationDocument && values.identificationDocument.length > 0) {
            const blobFile = new Blob([values.identificationDocument[0]], {type: "image/png"});
            formData = new FormData();
            formData.append("file", blobFile);
            formData.append("fileName", values.identificationDocument[0].name);
        }

        try {
            const patientData = {
                ...values,
                userId: user.$id,
                birthDate: new Date(values.birthDate),
                identificationDocument: formData,
            }

            const newPatient = await registerPatient(patientData);

            if (newPatient) router.push(`/patients/${user.$id}/new-appointment`);


        } catch (error) {
            console.log(error);
        }

        setIsLoading(false);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-12">
                <section className="mb-12 space-y-4">
                    <h1 className="header">Welcome 👋</h1>
                    <p className="text-dark-700">Get started with appointments.</p>
                </section>

                <section className="mb-12 space-y-4">
                    <div className="mb-9 space-y-1"><h2 className="sub-header">Personal Information</h2></div>
                </section>

                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="name"
                    label="Full name"
                    placeholder="John Doe"
                    iconSrc="/assets/icons/user.svg"
                    iconAlt="user"
                />

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="email"
                        label="Email"
                        placeholder="johndoe@gmail.com"
                        iconSrc="/assets/icons/email.svg"
                        iconAlt="email"
                    />

                    <CustomFormField
                        fieldType={FormFieldType.PHONE_INPUT}
                        control={form.control}
                        name="phone"
                        label="Phone number"
                        placeholder="(555) 123-4567"
                    />
                </div>

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.DATE_PICKER}
                        control={form.control}
                        name="birthDate"
                        label="Date of birth"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.SKELETON}
                        control={form.control}
                        name="gender"
                        label="Gender"
                        renderSkeleton={(field) => (
                            <FormControl>
                                <RadioGroup
                                    className="flex h-11 gap-6 xl:justify-between"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    {GenderOptions.map((option, i) => (
                                        <div key={option + i} className="radio-group">
                                            <RadioGroupItem value={option} id={option}/>
                                            <Label htmlFor={option} className="cursor-pointer">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        )}
                    />
                </div>

                {/*<section className="mb-12 space-y-4">*/}
                {/*    <div className="mb-9 space-y-1"><h2 className="sub-headere">Medical Information</h2></div>*/}
                {/*</section>*/}
                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="address"
                        label="Address"
                        placeholder="123 Main St"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="occupation"
                        label="Occupation"
                        placeholder="Software Engineer"
                    />
                </div>

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="emergencyContactName"
                        label="Emergency Contact Name"
                        placeholder="Jane Doe"
                    />

                    <CustomFormField
                        fieldType={FormFieldType.PHONE_INPUT}
                        control={form.control}
                        name="emergencyContactNumber"
                        label="Emergency Contact Number"
                        placeholder="(555) 123-4567"
                    />
                </div>

                <section className="mb-12 space-y-4">
                    <div className="mb-9 space-y-1"><h2 className="sub-header">Medical Information</h2></div>
                </section>

                <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="primaryPhysician"
                    label="Primary Physician"
                    placeholder="Select a physician">
                    {Doctors.map((doctor) => (
                        <SelectItem value={doctor.name} key={doctor.name}>
                            <div className="flex cursor-pointer items-center gap-2">
                                <Image src={doctor.image} width={32} height={32} alt={doctor.name}
                                       className="rounded-full border border-dark-500"/>
                                <p>{doctor.name}</p>
                            </div>
                        </SelectItem>
                    ))
                    }
                </CustomFormField>

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="insuranceProvider"
                        label="Insurance Provider"
                        placeholder="Blue Cross"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="insurancePolicyNumber"
                        label="Insurance Policy Number"
                        placeholder="123456789"
                    />
                </div>
                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="allergies"
                        label="Allergies (if any)"
                        placeholder="Peanuts, Shellfish"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="medications"
                        label="Medications (if any)"
                        placeholder="Aspirin, Ibuprofen"
                    />
                </div>

                <div className="flex flex-col gap-6 xl:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="familyMedicalHistory"
                        label="Family Medical History"
                        placeholder="Heart Disease, Diabetes"
                    />
                    <CustomFormField
                        fieldType={FormFieldType.TEXTAREA}
                        control={form.control}
                        name="pastMedicalHistory"
                        label="Past Medical History"
                        placeholder="Broken Arm, Appendectomy"
                    />
                </div>

                <section className="mb-12 space-y-4">
                    <div className="mb-9 space-y-1"><h2 className="sub-header">Identification and Verification</h2>
                    </div>
                </section>

                <CustomFormField
                    fieldType={FormFieldType.SELECT}
                    control={form.control}
                    name="identificationType"
                    label="Identification Type"
                    placeholder="Select identification type">
                    {IdentificationTypes.map((type) => (
                        <SelectItem value={type} key={type}>
                            {type}
                        </SelectItem>
                    ))
                    }
                </CustomFormField>

                <CustomFormField
                    fieldType={FormFieldType.INPUT}
                    control={form.control}
                    name="identificationNumber"
                    label="Identification Number"
                    placeholder="123456789"
                />

                <CustomFormField
                    fieldType={FormFieldType.SKELETON}
                    control={form.control}
                    name="identificationDocument"
                    label="Scanned Copy of Identification Document"
                    renderSkeleton={(field) => (
                        <FormControl>
                            <FileUploader files={field.value} onChange={field.onChange}/>
                        </FormControl>
                    )}
                />

                <section className="mb-12 space-y-4">
                    <div className="mb-9 space-y-1"><h2 className="sub-header">Consent and Privacy</h2>
                    </div>
                </section>

                <CustomFormField fieldType={FormFieldType.CHECKBOX} control={form.control} name="treatmentConsent"
                                 label="I consent to treatment"/>
                <CustomFormField fieldType={FormFieldType.CHECKBOX} control={form.control} name="disclosureConsent"
                                 label="I consent to disclosure of information"/>
                <CustomFormField fieldType={FormFieldType.CHECKBOX} control={form.control} name="privacyConsent"
                                 label="I consent to privacy policy"/>


                <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
            </form>
        </Form>
    );
};