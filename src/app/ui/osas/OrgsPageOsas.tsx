// components/ProfilePage.tsx
import { Orgs } from "@/app/lib/user";

type OrgsProp = {
  org: Orgs;
};

export default function OrgsPageOsas({ org }: OrgsProp) {
  return (
    <div style={{ padding: "2rem" }}>
      <img
        src={org.avatar}
        alt={org.name}
        style={{ width: 100, height: 100, borderRadius: "50%" }}
      />
      <h1>{org.name}</h1>
      <p>{org.bio}</p>
    </div>
  );
}
