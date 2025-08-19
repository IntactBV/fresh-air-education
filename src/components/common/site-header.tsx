"use client";

import { Separator } from "@ui/separator"
import { SidebarTrigger } from "@ui/sidebar"
import { Badge } from "../ui/badge";
import { $tradingMainStablecoin, $tradingPositionLeverage, $tradingSelectedCoin } from "@faeLib/signals/trading.signals";
import { useSignals } from "@preact/signals-react/runtime";
import { BadgeCheck, ChartBar, ChevronDown, Slash, Upload } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type TSiteHeaderProps = {
  title: string;
}

export function SiteHeader({
  title
}: TSiteHeaderProps) {
  useSignals();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* <Badge variant="outline" className="bg-zinc-900 text-white font-bold">
            {$tradingSelectedCoin.value}
            <ChevronDown />
          </Badge>
          <Badge variant="outline" className="bg-zinc-900 text-white font-bold">
            
            {$tradingMainStablecoin.value}
            <ChevronDown />
          </Badge> */}

            <Avatar >
              <AvatarImage src="https://crypto-central.io/library/uploads/bybit_logo-min.png" />
              <AvatarFallback>BB</AvatarFallback>
            </Avatar>

          <Select onValueChange={(e) => $tradingSelectedCoin.value = e} value={$tradingSelectedCoin.value}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Select stablecoin" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Bluechips</SelectLabel>
                <SelectItem value="BTC">BTC</SelectItem>
                <SelectItem value="ETH">ETH</SelectItem>
                <SelectItem value="SOL">SOL</SelectItem>
                <SelectItem value="XRP">XRP</SelectItem>
                <SelectItem value="BNB">BNB</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Layer 1</SelectLabel>
                <SelectItem value="SUI">SUI</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>DEX</SelectLabel>
                <SelectItem value="CAKE">CAKE</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Mame coins</SelectLabel>
                <SelectItem value="DOGE">DOGE</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <span>
            <Slash size={12} strokeWidth={2} />
          </span>

          <Select onValueChange={(e) => $tradingMainStablecoin.value = e} value={$tradingMainStablecoin.value}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Select stablecoin" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>FIAT</SelectLabel>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="RON">RON</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Stabelcoins</SelectLabel>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="EURI">EURI</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

            <Upload size={16} strokeWidth={.5} />

          <Select 
        value={$tradingPositionLeverage.value.toString()}
        onValueChange={(e) => $tradingPositionLeverage.value = parseInt(e)} 
      >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select stablecoin" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="1">1 X</SelectItem>
              <SelectItem value="2">2 X</SelectItem>
              <SelectItem value="3">3 X</SelectItem>
              <SelectItem value="5">5 X</SelectItem>
              <SelectItem value="7">7 X</SelectItem>
              <SelectItem value="9">9 X</SelectItem>
              <SelectItem value="10">10 X</SelectItem>
              <SelectItem value="12">12 X</SelectItem>
              <SelectItem value="15">15 X</SelectItem>
              <SelectItem value="20">20 X</SelectItem>
              <SelectItem value="24">24 X</SelectItem>
              <SelectItem value="25">25 X</SelectItem>
              <SelectItem value="30">30 X</SelectItem>
              <SelectItem value="50">50 X</SelectItem>
              <SelectItem value="70">70 X</SelectItem>
              <SelectItem value="75">75 X</SelectItem>
              <SelectItem value="100">100 X</SelectItem>
              <SelectItem value="125">125 X</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

          {/* <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button> */}
        </div>
      </div>
    </header>
  )
}
