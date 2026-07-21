import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();

interface ResourceInput {
  name: string;
  description: string;
  type: ResourceType;
  city: string;
  state: string;
  phone: string;
  website: string;
  hours: string;
  eligibility: string;
  cost: string;
  tags: string[];
  languages: string[];
}

async function main() {
  console.log("Seeding database...");

  const resources: ResourceInput[] = [
    {
      name: "Community Food Bank",
      description: "Provides emergency food assistance to families and individuals in need. Distribution every Tuesday and Thursday.",
      type: ResourceType.FOOD_ASSISTANCE,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0101",
      website: "https://example.com/foodbank",
      hours: "Tue-Thu 9am-3pm",
      eligibility: "No income requirements",
      cost: "Free",
      tags: ["food", "groceries", "emergency food"],
      languages: ["English", "Spanish"],
    },
    {
      name: "Senior Care Connection",
      description: "Connects families with affordable in-home care services for seniors. Offers free consultations and care assessments.",
      type: ResourceType.HOME_CARE,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0102",
      website: "https://example.com/seniorcare",
      hours: "Mon-Fri 8am-6pm",
      eligibility: "For seniors 65+",
      cost: "Sliding scale based on income",
      tags: ["senior care", "home care", "elderly"],
      languages: ["English"],
    },
    {
      name: "Health Access Program",
      description: "Helps individuals and families sign up for affordable health insurance, Medicare, and Medicaid. Bilingual staff available.",
      type: ResourceType.HEALTHCARE,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0103",
      website: "https://example.com/healthaccess",
      hours: "Mon-Fri 9am-5pm, Sat 10am-2pm",
      eligibility: "All income levels",
      cost: "Free",
      tags: ["health insurance", "medicare", "medicaid", "healthcare"],
      languages: ["English", "Spanish", "Vietnamese"],
    },
    {
      name: "Transportation Assistance",
      description: "Provides free or low-cost transportation to medical appointments for seniors and people with disabilities.",
      type: ResourceType.TRANSPORTATION,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0104",
      website: "https://example.com/transport",
      hours: "Mon-Fri 7am-7pm",
      eligibility: "Seniors 60+ or people with disabilities",
      cost: "Free for medical appointments",
      tags: ["transportation", "medical transport", "senior transport"],
      languages: ["English"],
    },
    {
      name: "Prescription Assistance Program",
      description: "Helps patients access affordable medications through manufacturer assistance programs and discount cards.",
      type: ResourceType.PRESCRIPTION_ASSISTANCE,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0105",
      website: "https://example.com/rxhelp",
      hours: "Mon-Fri 9am-5pm",
      eligibility: "No insurance or underinsured",
      cost: "Free service, medication costs vary",
      tags: ["prescriptions", "medications", "pharmacy", "discounts"],
      languages: ["English", "Spanish"],
    },
    {
      name: "Caregiver Support Group",
      description: "Weekly support group for family caregivers. Offers emotional support, resources, and practical advice from other caregivers.",
      type: ResourceType.SUPPORT_GROUP,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0106",
      website: "https://example.com/caregiversupport",
      hours: "Wednesdays 6pm-8pm",
      eligibility: "Family caregivers",
      cost: "Free",
      tags: ["caregiver", "support group", "mental health"],
      languages: ["English"],
    },
    {
      name: "Housing Assistance Council",
      description: "Provides rental assistance, housing counseling, and help with utility bills for low-income families and seniors.",
      type: ResourceType.HOUSING,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0107",
      website: "https://example.com/housinghelp",
      hours: "Mon-Fri 8am-5pm",
      eligibility: "Income-based eligibility",
      cost: "Free",
      tags: ["housing", "rental assistance", "utilities", "senior housing"],
      languages: ["English", "Spanish", "Russian"],
    },
    {
      name: "Financial Aid for Seniors",
      description: "Helps seniors access Supplemental Security Income (SSI), Social Security benefits, and other financial assistance programs.",
      type: ResourceType.FINANCIAL_ASSISTANCE,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0108",
      website: "https://example.com/seniorfinance",
      hours: "Mon-Fri 9am-4pm",
      eligibility: "Seniors 65+ and disabled adults",
      cost: "Free",
      tags: ["financial aid", "SSI", "social security", "senior benefits"],
      languages: ["English"],
    },
    {
      name: "Mental Health Support Line",
      description: "24/7 mental health crisis support and counseling for seniors and caregivers. Immediate phone support available.",
      type: ResourceType.MENTAL_HEALTH,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0109",
      website: "https://example.com/mentalhealth",
      hours: "24/7",
      eligibility: "No restrictions",
      cost: "Free",
      tags: ["mental health", "crisis", "counseling", "support"],
      languages: ["English", "Spanish", "Mandarin"],
    },
    {
      name: "Meals on Wheels Portland",
      description: "Delivers nutritious meals to homebound seniors. Special dietary needs accommodated including diabetic, low-sodium, and pureed options.",
      type: ResourceType.FOOD_ASSISTANCE,
      city: "Portland",
      state: "OR",
      phone: "(503) 555-0110",
      website: "https://example.com/mealsonwheels",
      hours: "Delivery Mon-Fri 11am-1pm",
      eligibility: "Seniors 60+ who are homebound",
      cost: "Suggested donation $3.50/meal",
      tags: ["meals", "senior meals", "homebound", "nutrition"],
      languages: ["English"],
    },
  ];

  for (const resource of resources) {
    await prisma.communityResource.create({ data: resource });
  }

  console.log(`Created ${resources.length} community resources`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
