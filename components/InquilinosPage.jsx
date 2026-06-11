"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useTenants } from "@/context/TenantContext";
import { TenantStatsRow } from "@/components/inquilinos/TenantStatsRow";
import { TenantTable } from "@/components/inquilinos/TenantTable";
import { TenantFormModal } from "@/components/inquilinos/TenantFormModal";
import { DeleteConfirmModal } from "@/components/inquilinos/DeleteConfirmModal";

export function InquilinosPage() {
  const { tenants, addTenant, removeTenant, updateTenant, loading } = useTenants();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const activeCount = tenants.filter((t) => t.activo).length;

  const handleAdd = async (data) => {
    await addTenant(data);
    setShowAddModal(false);
  };

  const handleEdit = async (data) => {
    await updateTenant(editTenant.id, data);
    setEditTenant(null);
  };

  const handleDelete = async (id) => {
    await removeTenant(id);
  };

  const handleToggleActive = (tenant) => {
    updateTenant(tenant.id, { activo: !tenant.activo });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400 text-sm">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Manrope'] font-bold text-2xl text-[#191c1d]">Inquilinos</h1>
          <p className="text-sm text-[#40493d] mt-1">Gestiona los inquilinos de tu propiedad</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0d631b] text-white rounded-lg font-['Manrope'] text-sm font-semibold hover:bg-[#2e7d32] transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <UserPlus size={18} />
          Agregar Inquilino
        </button>
      </div>

      {/* Stats */}
      <TenantStatsRow total={tenants.length} active={activeCount} />

      {/* Table */}
      <TenantTable
        tenants={tenants}
        onEdit={setEditTenant}
        onDelete={setDeleteTarget}
        onToggleActive={handleToggleActive}
      />

      {/* Add Modal */}
      {showAddModal && (
        <TenantFormModal
          title="Nuevo Inquilino"
          subtitle="Completa los datos del nuevo inquilino"
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
        />
      )}

      {/* Edit Modal */}
      {editTenant && (
        <TenantFormModal
          title="Editar Inquilino"
          subtitle="Modifica los datos del inquilino"
          initialData={editTenant}
          submitLabel="Guardar Cambios"
          onClose={() => setEditTenant(null)}
          onSubmit={handleEdit}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <DeleteConfirmModal
          tenant={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
