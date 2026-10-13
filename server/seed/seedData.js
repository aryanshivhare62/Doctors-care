const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = require('../config/config');
const User = require('../models/User');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const ContactMessage = require('../models/ContactMessage');

const standardSlots = [
  { startTime: '09:00 AM', endTime: '09:30 AM' },
  { startTime: '09:30 AM', endTime: '10:00 AM' },
  { startTime: '10:00 AM', endTime: '10:30 AM' },
  { startTime: '10:30 AM', endTime: '11:00 AM' },
  { startTime: '11:00 AM', endTime: '11:30 AM' },
  { startTime: '11:30 AM', endTime: '12:00 PM' },
  { startTime: '02:00 PM', endTime: '02:30 PM' },
  { startTime: '02:30 PM', endTime: '03:00 PM' },
  { startTime: '03:00 PM', endTime: '03:30 PM' },
  { startTime: '03:30 PM', endTime: '04:00 PM' },
  { startTime: '04:00 PM', endTime: '04:30 PM' },
  { startTime: '04:30 PM', endTime: '05:00 PM' },
];

const standardWeeklyAvailability = [
  { dayOfWeek: 'Monday', slots: standardSlots },
  { dayOfWeek: 'Tuesday', slots: standardSlots },
  { dayOfWeek: 'Wednesday', slots: standardSlots },
  { dayOfWeek: 'Thursday', slots: standardSlots },
  { dayOfWeek: 'Friday', slots: standardSlots },
  { dayOfWeek: 'Saturday', slots: standardSlots.slice(0, 6) },
];

const departmentsData = [
  {
    name: 'Cardiology',
    description: 'Expert diagnostics, preventative cardiovascular assessments, non-invasive imaging, and intervention for cardiac health.',
    image: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?auto=format&fit=crop&w=800&q=80',
    icon: 'Heart',
    headDoctor: 'Dr. Marcus Sterling',
    services: ['Echocardiogram (ECG)', 'Coronary Angiography', 'Holter Monitoring', 'Hypertension Clinic', 'Heart Failure Care'],
  },
  {
    name: 'Dermatology',
    description: 'Comprehensive dermatological care for complex skin diseases, eczema, psoriasis, acne, and aesthetic skin health.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    icon: 'Sparkles',
    headDoctor: 'Dr. Maya Patel',
    services: ['Acne & Scar Laser Treatment', 'Skin Cancer Screening', 'Psoriasis Management', 'Allergy Patch Testing', 'Mole Removal'],
  },
  {
    name: 'Neurology',
    description: 'State-of-the-art neurological examinations and therapeutic programs for brain, spinal cord, and peripheral nerve disorders.',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    icon: 'Brain',
    headDoctor: 'Dr. Elena Rostova',
    services: ['EEG & EMG Diagnostics', 'Stroke Rehabilitation', 'Migraine Management', 'Epilepsy Care', 'Memory & Dementia Support'],
  },
  {
    name: 'Orthopedics',
    description: 'Advanced musculoskeletal care encompassing sports injury treatments, joint reconstruction, spinal care, and trauma management.',
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
    icon: 'Bone',
    headDoctor: 'Dr. David Chen',
    services: ['Joint Replacement (Hip & Knee)', 'Sports Arthroscopy', 'Spine Rehabilitation', 'Fracture Care', 'Physical Therapy'],
  },
  {
    name: 'Pediatrics',
    description: 'Compassionate pediatric care prioritizing infant immunization, developmental milestones, adolescent wellness, and childhood illnesses.',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    icon: 'Baby',
    headDoctor: 'Dr. Sarah Jenkins',
    services: ['Newborn Assessments', 'Pediatric Vaccination', 'Growth & Nutrition Counseling', 'Asthma Management', 'Adolescent Care'],
  },
  {
    name: 'Dentistry',
    description: 'Modern cosmetic and preventive dentistry services covering root canals, painless extractions, aligners, and dental hygiene.',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
    icon: 'Smile',
    headDoctor: 'Dr. Robert Hayes',
    services: ['Laser Teeth Whitening', 'Invisible Aligners', 'Painless Root Canal', 'Dental Implants', 'Periodontal Therapy'],
  },
  {
    name: 'General Medicine',
    description: 'Holistic primary care, comprehensive annual health checkups, preventative screenings, and management of chronic lifestyle disorders.',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
    icon: 'Stethoscope',
    headDoctor: 'Dr. Priya Sharma',
    services: ['Annual Preventive Screenings', 'Diabetes Management', 'Thyroid Disorder Treatment', 'Infectious Disease Care', 'Geriatric Health'],
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB at:', config.mongoUri);
    await mongoose.connect(config.mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Appointment.deleteMany({}),
      ContactMessage.deleteMany({}),
    ]);

    console.log('[Seed] Inserting Departments...');
    const createdDepartments = await Department.insertMany(departmentsData);
    const deptMap = {};
    createdDepartments.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    console.log('[Seed] Creating Users...');
    const adminPasswordHash = await User.hashPassword('Admin@123');
    const doctorPasswordHash = await User.hashPassword('Doctor@123');
    const patientPasswordHash = await User.hashPassword('Patient@123');

    // Admin user
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@doctorscares.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1 (555) 019-2831',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    });

    // Doctor user 1 (Dr. Marcus Sterling)
    const doctorUser1 = await User.create({
      name: 'Dr. Marcus Sterling',
      email: 'marcus.sterling@doctorscares.com',
      passwordHash: doctorPasswordHash,
      role: 'doctor',
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    });

    // Doctor user 2 (Dr. Sarah Jenkins)
    const doctorUser2 = await User.create({
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.jenkins@doctorscares.com',
      passwordHash: doctorPasswordHash,
      role: 'doctor',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1594824813576-43e7c81d89b6?auto=format&fit=crop&w=400&q=80',
    });

    // Patient user
    const demoPatient = await User.create({
      name: 'Alex Taylor',
      email: 'patient@doctorscares.com',
      passwordHash: patientPasswordHash,
      role: 'patient',
      phone: '+1 (555) 789-0123',
      bloodGroup: 'O+',
      gender: 'male',
      dateOfBirth: new Date('1998-05-14'),
      address: {
        street: '42 Greenway Street',
        city: 'Metro City',
        state: 'CA',
        postalCode: '90210',
      },
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    console.log('[Seed] Creating Doctors...');
    const doctorsData = [
      {
        user: doctorUser1._id,
        name: 'Dr. Marcus Sterling',
        email: 'marcus.sterling@doctorscares.com',
        phone: '+1 (555) 345-6789',
        department: deptMap['Cardiology'],
        specialty: 'Interventional Cardiology',
        qualifications: ['MBBS', 'MD Cardiology', 'FACC (USA)'],
        experienceYears: 16,
        consultationFee: 120,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        bio: 'Senior Interventional Cardiologist specializing in coronary stents, hypertension control, and preventive heart failure management.',
        about: 'Dr. Sterling has conducted over 3,000 successful cardiac interventions. He is widely published in international journals and advocates for lifestyle-centric cardiology alongside high-precision interventional therapy.',
        location: { hospital: 'Doctors Cares Main Campus', address: '100 Medical Center Blvd, Floor 3', city: 'Metro City' },
        rating: 4.9,
        totalReviews: 142,
        availability: standardWeeklyAvailability,
        isFeatured: true,
      },
      {
        user: doctorUser2._id,
        name: 'Dr. Sarah Jenkins',
        email: 'sarah.jenkins@doctorscares.com',
        phone: '+1 (555) 987-6543',
        department: deptMap['Pediatrics'],
        specialty: 'Pediatric Medicine & Child Wellness',
        qualifications: ['MD Pediatrics', 'FAAP', 'Fellow in Pediatric Pulmonology'],
        experienceYears: 11,
        consultationFee: 85,
        avatar: 'https://images.unsplash.com/photo-1594824813576-43e7c81d89b6?auto=format&fit=crop&w=400&q=80',
        bio: 'Compassionate pediatrician focusing on pediatric asthma, nutritional growth, and newborn developmental milestones.',
        about: 'Dr. Jenkins provides a warm, kid-friendly clinical environment that removes anxiety from doctor visits. She is committed to long-term child health surveillance and parental empowerment.',
        location: { hospital: 'Doctors Cares Children’s Pavilion', address: '104 Medical Center Blvd, Suite 210', city: 'Metro City' },
        rating: 4.9,
        totalReviews: 189,
        availability: standardWeeklyAvailability,
        isFeatured: true,
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@doctorscares.com',
        phone: '+1 (555) 456-7890',
        department: deptMap['Neurology'],
        specialty: 'Clinical Neurology & Neurophysiology',
        qualifications: ['MD Neurology', 'DM Clinical Neurophysiology', 'FINA'],
        experienceYears: 14,
        consultationFee: 140,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
        bio: 'Renowned neurologist specialized in intractable migraine protocols, stroke recovery, and epilepsy management.',
        about: 'Dr. Rostova has dedicated over 14 years to diagnosing intricate neuromuscular disorders and designing neuro-rehabilitative pathways that optimize quality of life.',
        location: { hospital: 'Doctors Cares Neuro Institute', address: '108 Medical Center Blvd, Floor 4', city: 'Metro City' },
        rating: 4.8,
        totalReviews: 96,
        availability: standardWeeklyAvailability,
        isFeatured: true,
      },
      {
        name: 'Dr. David Chen',
        email: 'david.chen@doctorscares.com',
        phone: '+1 (555) 234-5678',
        department: deptMap['Orthopedics'],
        specialty: 'Orthopedic Joint Replacement & Sports Medicine',
        qualifications: ['MS Orthopedics', 'M.Ch Ortho (UK)', 'Fellow in Arthroscopy'],
        experienceYears: 15,
        consultationFee: 110,
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
        bio: 'Expert orthopedic surgeon specializing in robotic joint replacements, ligament repairs, and athletic injury restoration.',
        about: 'Dr. Chen collaborates with professional sports teams and everyday patients to restore pain-free biomechanical mobility using minimally invasive techniques.',
        location: { hospital: 'Doctors Cares Orthopedic Center', address: '102 Medical Center Blvd, Suite 105', city: 'Metro City' },
        rating: 4.8,
        totalReviews: 114,
        availability: standardWeeklyAvailability,
        isFeatured: true,
      },
      {
        name: 'Dr. Maya Patel',
        email: 'maya.patel@doctorscares.com',
        phone: '+1 (555) 678-9012',
        department: deptMap['Dermatology'],
        specialty: 'Medical & Aesthetic Dermatology',
        qualifications: ['MD Dermatology', 'DNB', 'Board Certified Dermatologist'],
        experienceYears: 9,
        consultationFee: 95,
        avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&q=80',
        bio: 'Dedicated dermatologist providing precision therapies for severe acne, eczema, psoriasis, and aesthetic rejuvenation.',
        about: 'Dr. Patel emphasizes evidence-based clinical dermatology, ensuring every treatment plan is tailored to the patient skin type and lifestyle.',
        location: { hospital: 'Doctors Cares Skin Care Center', address: '110 Medical Center Blvd, Suite 300', city: 'Metro City' },
        rating: 4.7,
        totalReviews: 88,
        availability: standardWeeklyAvailability,
        isFeatured: false,
      },
      {
        name: 'Dr. Robert Hayes',
        email: 'robert.hayes@doctorscares.com',
        phone: '+1 (555) 789-2345',
        department: deptMap['Dentistry'],
        specialty: 'Comprehensive & Cosmetic Dentistry',
        qualifications: ['DDS', 'MDS Orthodontics', 'AAID Fellow'],
        experienceYears: 12,
        consultationFee: 80,
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
        bio: 'Gentle restorative dental specialist skilled in painless root canal treatments, aesthetic veneers, and invisible aligners.',
        about: 'Dr. Hayes has transformed hundreds of smiles through stress-free dental methodologies that prioritize both dental aesthetics and long-term oral health.',
        location: { hospital: 'Doctors Cares Dental Suite', address: '100 Medical Center Blvd, Ground Floor', city: 'Metro City' },
        rating: 4.9,
        totalReviews: 130,
        availability: standardWeeklyAvailability,
        isFeatured: false,
      },
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@doctorscares.com',
        phone: '+1 (555) 890-1234',
        department: deptMap['General Medicine'],
        specialty: 'Internal Medicine & Preventative Health',
        qualifications: ['MBBS', 'MD Internal Medicine', 'FACP'],
        experienceYears: 13,
        consultationFee: 75,
        avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80',
        bio: 'Senior physician dedicated to holistic lifestyle medicine, chronic diabetes control, and annual preventive health audits.',
        about: 'Dr. Sharma believes that patient education and proactive preventive diagnostics are the cornerstone of sustained health across every decade of adulthood.',
        location: { hospital: 'Doctors Cares Primary Clinic', address: '100 Medical Center Blvd, Suite 101', city: 'Metro City' },
        rating: 4.8,
        totalReviews: 175,
        availability: standardWeeklyAvailability,
        isFeatured: true,
      },
    ];

    const createdDoctors = await Doctor.insertMany(doctorsData);

    console.log('[Seed] Creating Sample Appointments...');
    // Generate dates relative to current date
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 4);

    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - 5);

    const sampleAppointments = [
      {
        patient: demoPatient._id,
        doctor: createdDoctors[0]._id, // Dr. Marcus Sterling
        department: deptMap['Cardiology'],
        appointmentDate: formatDate(tomorrow),
        timeSlot: '10:00 AM - 10:30 AM',
        status: 'confirmed',
        reason: 'Routine annual cardiovascular checkup and ECG evaluation.',
        patientNotes: 'Experiencing occasional mild chest fluttering after morning jogging.',
        doctorNotes: 'Reviewed history. Will conduct standard 12-lead ECG and lipid review.',
      },
      {
        patient: demoPatient._id,
        doctor: createdDoctors[1]._id, // Dr. Sarah Jenkins
        department: deptMap['Pediatrics'],
        appointmentDate: formatDate(nextWeek),
        timeSlot: '02:00 PM - 02:30 PM',
        status: 'pending',
        reason: 'Pediatric immunization consultation for younger sibling.',
        patientNotes: 'Checking MMR booster timing.',
      },
      {
        patient: demoPatient._id,
        doctor: createdDoctors[6]._id, // Dr. Priya Sharma
        department: deptMap['General Medicine'],
        appointmentDate: formatDate(pastDate),
        timeSlot: '09:00 AM - 09:30 AM',
        status: 'completed',
        reason: 'Seasonal allergy follow-up and prescription refill.',
        patientNotes: 'Sneezing subsided after antihistamines.',
        doctorNotes: 'Symptoms resolved. Patient advised to continue allergen precautions.',
      },
    ];

    await Appointment.insertMany(sampleAppointments);

    console.log('[Seed] Creating Sample Contact Messages...');
    await ContactMessage.insertMany([
      {
        name: 'Sarah Connor',
        email: 'sarah.c@example.com',
        phone: '+1 (555) 443-2211',
        subject: 'Inquiry regarding health insurance coverage',
        message: 'Hello, I would like to confirm whether BlueCross BlueShield PPO is accepted for orthopedic outpatient surgery at your main campus.',
        status: 'unread',
      },
      {
        name: 'James Wilson',
        email: 'jwilson@example.com',
        phone: '+1 (555) 778-9900',
        subject: 'Executive Comprehensive Health Checkup Packages',
        message: 'Could you please email me the detailed brochure and fasting guidelines for your Full Body Executive Health Checkup package?',
        status: 'read',
      },
    ]);

    console.log('=================================================');
    console.log('✅ Seed Data Successfully Loaded!');
    console.log('=================================================');
    console.log('Default Accounts:');
    console.log('👑 Admin:   admin@doctorscares.com   / Admin@123');
    console.log('🩺 Doctor:  marcus.sterling@doctorscares.com / Doctor@123');
    console.log('🩺 Doctor:  sarah.jenkins@doctorscares.com   / Doctor@123');
    console.log('👤 Patient: patient@doctorscares.com / Patient@123');
    console.log('=================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
