"use client";

import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AccountInfo() {
  const { localUser, setLocalUser } = useAppContext();
  const [accountModal, setAccountModal] = useState(false);
  const [file, setFile] = useState(null);

  const router = useRouter();

  // image upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImageSave = async () => {
    setAccountModal(false);
    if (!file) return;
    const formData = new FormData();

    const compressed = await imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 400,
      useWebWorker: true,
    });

    formData.append("file", compressed);
    formData.append("upload_preset", "profile_pic");

    const load = toast.loading("Uploading...")

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (res.status !== 200) {
        console.log(res);
        toast.error("Failed to upload to cloudinary");
        return;
      }
      const data = await res.json();

      setLocalUser((prev) => ({
        ...prev,
        imageUrl: data.secure_url,
      }));

      const updateRes = await fetch(`api/users`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ imageUrl: data.secure_url }),
      });

      if (updateRes.status === 201) {
        toast.success("Image updated", { id:load });
      } else {
        toast.error("Upload failed, reload to see prev profile pic", { id:load });
      }
    } catch (error) {
      toast.error(error.message, {id:load});
    }
  };

  // Account delete part
  const handleAccountDelete = async () => {
    try {
      const res = await fetch(`/api/users/`, {
        method: "delete",
        credentials: "include",
      });
      if (res.status === 204) {
        toast.success("Account deleted");
        setAccountModal(false);
        router.push("/");
        router.refresh();
        // setLocalUser({});
      } else {
        toast.error("Failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleModalClose = (value) => {
    setFile(null);
    setAccountModal(value);
  };

  if (localUser) {
    return (
      <>
        <button
          className="button-secondary"
          onClick={() => handleModalClose(true)}
        >
          Account
        </button>
        <div
          className={`absolute top-0 left-0 h-svh w-svw pb-28 flex justify-center z-20 items-center duration-200 ease-in-out ${
            accountModal ? "scale-100" : "scale-0"
          }`}
          onClick={() => handleModalClose(false)}
        >
          <div
            className="p-16 pb-10 border-1 rounded-xl border-[var(--border)] flex flex-col gap-4 bg-[var(--background)] relative opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col relative overflow-hidden gap-4 items-center">
                <label
                  htmlFor="file"
                  className="relative cursor-pointer h-[5rem] w-[5rem] sm:h-[7rem] sm:w-[7rem] items-center flex justify-center rounded-full overflow-hidden group"
                >
                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="profile_pic"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <figure
                      className=" h-full w-full flex justify-center items-center rounded-full bg-red-500"
                      style={{ backgroundColor: localUser.avatarBg }}
                    >
                      {localUser.imageUrl ? (
                        <Image
                          src={localUser.imageUrl}
                          alt="profile_pic"
                          height={200}
                          width={200}
                          priority
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <h1 className="text-white sm:text-xl pb-1">
                          {localUser.username[0]}
                        </h1>
                      )}
                    </figure>
                  )}

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleFileChange(e)}
                    id="file"
                  />

                  <div className="absolute h-full w-full bg-gray-700 opacity-0 group-hover:opacity-50 duration-200 flex justify-center items-center">
                    <IoCloudUploadOutline className="text-3xl text-white translate-y-60 group-hover:translate-y-0 ease-in-out duration-300" />
                  </div>
                </label>
              </div>

              <h2 className="">{localUser.username}</h2>
              <p className="text-secondary">{localUser.email}</p>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 mt-4">
                <button
                  className="button-primary !w-[8rem] hover:!bg-red-500 hover:!text-white"
                  onClick={handleAccountDelete}
                >
                  Delete User
                </button>
                <button
                  className="button-secondary !w-[8rem] active:!scale-90"
                  onClick={handleImageSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
