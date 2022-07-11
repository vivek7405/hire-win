import { GetServerSidePropsContext, GetStaticPropsContext, Head, Image, Link, Routes } from "blitz"
import getCurrentUserServer from "app/users/queries/getCurrentUserServer"
import path from "path"
import LogoBrand from "app/assets/LogoBrand"
import { useState } from "react"
import LandingLayout from "app/core/layouts/LandingLayout"

export async function getStaticProps(context: GetStaticPropsContext) {
  path.resolve("next.config.js")
  path.resolve("blitz.config.js")
  path.resolve(".next/blitz/db.js")

  return {
    props: {},
  }
}

export default function Privacy() {
  return (
    <LandingLayout title="hire-win | Privacy">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl">Privacy Policy</h1>
      </div>
    </LandingLayout>
  )
}
