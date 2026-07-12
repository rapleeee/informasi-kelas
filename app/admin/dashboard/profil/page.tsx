import ProfilForm from "@/components/admin/profil/ProfilForm";

export default function ProfilPage() {
  return (
    <div>
      <div className="mb-8 brutal-block bg-white p-6 shadow-[4px_4px_0px_#000]">
        <h1 className="heading-brutal text-3xl">Profil Admin</h1>
        <p className="text-foreground font-bold mt-2">
          Ubah username atau password untuk login admin.
        </p>
      </div>

      <div className="brutal-card p-6 shadow-[6px_6px_0px_#000]">
        <ProfilForm />
      </div>
    </div>
  );
}
