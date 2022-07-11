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

export default function Cookies() {
  return (
    <LandingLayout title="hire-win | Cookies">
      <div className="w-full h-full flex justify-center">
        <h1 className="font-bold text-5xl">Cookie Use</h1>
      </div>
    </LandingLayout>
  )
}
