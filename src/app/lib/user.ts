// lib/users.ts

export type Orgs = {
  username: string;
  name: string;
  bio: string;
  avatar: string;
};

// This can later be replaced with a fetch to your API or DB
const orgs: Record<string, Orgs> = {
  osas: {
      username: "osas",
      name: "Office of students affairs",
      bio: "Full Stack Developer",
      avatar: "[insert pic here]",
    },
    elix: {
      username: "elix",
      name: "Elix",
      bio: "Product Designer",
      avatar: "[insert pic here]",
    },
    iact: {
      username: "iact",
      name: "iacademy act",
      bio: "Mobile Engineer",
      avatar: "[insert pic here]",
    }
};

export function getAllUsernames() {
  return Object.keys(orgs);
}

export function getUserByUsername(username: string): Orgs | null {
  return orgs[username] || null;
}