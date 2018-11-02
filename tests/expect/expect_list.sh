#!/usr/bin/expect

set test_case "expect_list test case "
# no timeout -1
set timeout 200
set action "list"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set sourceChain [lindex $argv 2]
set tokenAddr [lindex $argv 3]

set fd [open ./test a]

if {$testnet eq "true"} {
	set test "--testnet"
} else {
	set test ""
}

if {$sourceChain eq "WAN"} {
	# set gasPrice "180"
	set direction "outBound"
} else {
	# set gasPrice "10"
	set direction "inBound"
}
set destChain "ETH"

spawn node ../commands/cli.js $test

log_file test_log

expect "wallet-cli$ "

send "${action}\n"

expect {
	"Source Chain" {
		send "${sourceChain}\n"
		}
}

if {$sourceChain eq "WAN"} {
	expect {
		"Destination Chain" {
			send "${destChain}\r";
		}
		"Please input again." {
			puts $fd "${test_case}${direction} failed, Source Chain: ${sourceChain}"
			send "exit\n"
			exit
		}
	}
	expect {
		"Token Symbol" {
			send "${tokenAddr}\r"
			}
		"Please input again." {
			puts $fd "${test_case}${direction} failed, Destination Chain: ${destChain}"
			send "exit\n"
			exit
		}
	}
} else {
	expect {
		"Token Symbol" {
			send "${tokenAddr}\r"
			}
		"Please input again." {
			puts $fd "${test_case}${direction} failed, Source Chain: ${sourceChain}"
			send "exit\n"
			exit
		}
	}
}

expect {
	"Please input again." {
		puts $fd "${test_case}${direction} failed, Token Symbol: ${tokenAddr}"
		send "exit\n"
		exit
	}
	"Name:  " {
		puts $fd "${test_case}${direction} successful"
	}
	"No transaction found" {
		puts $fd "${test_case}${direction} successful, No transaction for redeem found"
		exit
	}
}

expect {
	"wallet-cli$ " {
		send "exit\n"
	}
	eof {
		exit
	}
}

expect eof
close $fd
exit

