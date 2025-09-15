-- CreateTable
CREATE TABLE "clients" (
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "profile_picture" TEXT,
    "age" INTEGER,
    "gender" CHAR(1),
    "address" TEXT,
    "password" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "services" (
    "service_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "picture" TEXT,
    "description" TEXT,
    "service_type" TEXT NOT NULL,
    "specialization" TEXT,
    "work_days_from" TEXT NOT NULL,
    "work_days_to" TEXT NOT NULL,
    "work_hours_from" TEXT NOT NULL,
    "work_hours_to" TEXT NOT NULL,
    "appointment_duration" TEXT NOT NULL,
    "appointment_fee" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "services_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "email_verification" (
    "email" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "email_verification_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "security_questions" (
    "question_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,

    CONSTRAINT "security_questions_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "client_user_questions" (
    "email" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "client_user_questions_pkey" PRIMARY KEY ("email","question_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointment_id" TEXT NOT NULL,
    "client_email" TEXT,
    "service_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time_from" TEXT NOT NULL,
    "time_to" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "appointment_history" (
    "history_id" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "date_and_time" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "appointment_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "client_email" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("client_email","service_id","history_id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "client_email" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "review" TEXT NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("client_email","service_id","history_id")
);

-- AddForeignKey
ALTER TABLE "email_verification" ADD CONSTRAINT "email_verification_email_fkey" FOREIGN KEY ("email") REFERENCES "clients"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_user_questions" ADD CONSTRAINT "client_user_questions_email_fkey" FOREIGN KEY ("email") REFERENCES "clients"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_user_questions" ADD CONSTRAINT "client_user_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "security_questions"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "clients"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_history" ADD CONSTRAINT "appointment_history_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "clients"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_history" ADD CONSTRAINT "appointment_history_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "clients"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "appointment_history"("history_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_email_fkey" FOREIGN KEY ("client_email") REFERENCES "clients"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "appointment_history"("history_id") ON DELETE CASCADE ON UPDATE CASCADE;
