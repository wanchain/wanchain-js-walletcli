#!/usr/bin/expect

set test_case "expect_balance "
# no timeout -1
set timeout -1
set action "balance"

set testLabel [lindex $argv 0]
set test_case "${test_case}${testLabel} "
set testnet [lindex $argv 1]
set sourceChain [lindex $argv 2]
set tokenSymbol [lindex $argv 3]
set account [lindex $argv 4]

set fd [open ./test_result a]

if {$testnet eq "true"} {
	set test "--testnet"
} else {
	set test ""
}

spawn node commands/cli.js $test

log_file test_log

expect "wallet-cli$ "

send "${action}\n"

expect {
	"Chain" {
		send_user "${sourceChain}\n"
		send "${sourceChain}\n"
		}
}

expect {
	"Token Symbol" {
		send "${tokenSymbol}\r"
		}
	"Please input again." {
		puts $fd "${test_case} failed, Source Chain: ${sourceChain}"
		send "exit\n"
		exit
	}
}

expect	{
	"Input the index or address of account:" {
			send "${account}\n"
		}
	"Please input again." {
		puts $fd "${test_case} failed, Token Symbol: ${tokenSymbol}"
		send "exit\n"
		exit
	}
}

expect {
	"Please input again." {
		puts $fd "${test_case} failed, account: ${account}"
		send "exit\n"
		exit
	}
	"Account" {
		puts $fd "${test_case} successful"
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

